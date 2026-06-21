import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { In } from "typeorm"

import { Admin } from "../Admin"
import { Personnel } from "../Personnel"
import { Price } from "../Price"
import { Register } from "../Register"
import { E_ScheduleStatus, Schedule } from "../Schedule"
import { Session } from "../Session"
import { Class } from "./class.entity"
import { CreateClassRq, EditClassRq, FetchClassListRq, FetchClassPricesRq, ToggleClassStatus } from "./class.rq"
import type { ClassSessionPopulation } from "./class.rs"
import { ClassSessionPopulations } from "./class.rs"

@Resolver()
export class ClassResolver {
    @Query(() => [Class])
    @UseMiddleware([AuthMiddleware])
    async fetchClassList(
        @Arg("body") { title, type, instructor_token, is_active }: FetchClassListRq,
    ): Promise<Class[]> {
        const classes = await Class.find({
            where: {
                ...(title && { title: title.trim() }),
                ...(type && { type }),
                ...(instructor_token && { instructor_token }),
                ...(is_active !== undefined && is_active !== null && { is_active }),
            },
            relations: ["sessions", "instructor", "prices"],
            order: {
                is_active: "DESC",
                created_at: "DESC",
            },
        })

        return classes
    }

    @Query(() => [Class])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveClassList(@Arg("body") { title, type, instructor_token }: FetchClassListRq): Promise<Class[]> {
        const classes = await Class.find({
            where: {
                ...(title && { title: title.trim() }),
                ...(type && { type }),
                ...(instructor_token && { instructor_token }),
                is_active: true,
            },
            relations: ["sessions", "instructor", "prices"],
            order: { created_at: "DESC" },
        })

        return classes
    }

    @Query(() => [Price])
    @UseMiddleware([AuthMiddleware])
    async fetchClassPrices(@Arg("body") { class_token, is_active }: FetchClassPricesRq): Promise<Price[]> {
        const classEntity = await Class.findOne({ where: { token: class_token } })
        if (!classEntity) throw generateHttpError("class_not_found")

        const prices = await Price.find({
            where: {
                class_token,
                ...(is_active !== undefined && { is_active }),
            },
            order: { created_at: "DESC" },
        })

        return prices
    }

    @Query(() => [ClassSessionPopulations])
    @UseMiddleware([AuthMiddleware])
    async fetchClassSessionPopulations(): Promise<ClassSessionPopulations[]> {
        const classes = await Class.find({
            where: { is_active: true },
            relations: ["sessions", "instructor"],
        })

        const result: ClassSessionPopulations[] = await Promise.all(
            classes.map(async classEntity => {
                const sessionPopulations: ClassSessionPopulation[] = await Promise.all(
                    classEntity.sessions.map(async session => {
                        // Find all registers for this class
                        const registers = await Register.find({
                            where: { class_token: classEntity.token },
                            select: ["token"],
                        })
                        const registerTokens = registers.map(r => r.token)

                        if (registerTokens.length === 0) {
                            return {
                                session_token: session.token,
                                session,
                                population_count: 0,
                            }
                        }

                        // Find all schedules with UNSET status for this session and these registers
                        const unsetSchedules = await Schedule.find({
                            where: {
                                register_token: In(registerTokens),
                                submission_session_token: session.token,
                                status: E_ScheduleStatus.UNSET,
                            },
                            select: ["register_token"],
                        })

                        // Count unique registrants (each register counted once regardless of how many UNSET schedules they have)
                        const uniqueRegisterTokens = [...new Set(unsetSchedules.map(s => s.register_token))]
                        const population_count = uniqueRegisterTokens.length

                        return {
                            session_token: session.token,
                            session,
                            population_count,
                        }
                    }),
                )

                const total_population = sessionPopulations.reduce((sum, sp) => sum + sp.population_count, 0)

                return {
                    class_token: classEntity.token,
                    class: classEntity,
                    sessions: sessionPopulations,
                    total_population,
                }
            }),
        )

        return result
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async toggleClassStatus(@Arg("body") { token }: ToggleClassStatus): Promise<boolean> {
        const classEntity = await Class.findOne({ where: { token } })
        if (!classEntity) throw generateHttpError("class_not_found")

        classEntity.is_active = !classEntity.is_active
        await classEntity.save()

        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async createClass(
        @Ctx("admin") admin: Admin,
        @Arg("body") { title, session_tokens, type, instructor_token }: CreateClassRq,
    ): Promise<boolean> {
        const instructor = await Personnel.findOne({ where: { token: instructor_token } })
        if (!instructor) throw generateHttpError("instructor_not_found")

        const existingClassWithCombination = await Class.findOne({
            where: { title, type, instructor_token },
        })
        if (existingClassWithCombination) throw generateHttpError("class_title_type_instructor_already_exists")

        const sessions = await Session.find({ where: { token: In(session_tokens) } })
        if (sessions.length !== session_tokens.length) throw generateHttpError("invalid_session_tokens")

        const classEntity = await Class.create({
            title,
            sessions,
            type,
            instructor_token,
            admin_token: admin.token,
        }).save()

        return !!classEntity
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editClass(
        @Arg("body") { token, title, session_tokens, type, instructor_token }: EditClassRq,
    ): Promise<boolean> {
        const classEntity = await Class.findOne({ where: { token }, relations: ["sessions"] })
        if (!classEntity) throw generateHttpError("class_not_found")

        const newType = type || classEntity.type
        const newInstructorToken = instructor_token || classEntity.instructor_token

        if (
            (title && title.trim() !== classEntity.title) ||
            (type && type !== classEntity.type) ||
            (instructor_token && instructor_token !== classEntity.instructor_token)
        ) {
            if (instructor_token) {
                const instructor = await Personnel.findOne({ where: { token: instructor_token } })
                if (!instructor) throw generateHttpError("instructor_not_found")
            }

            const existingWithCombination = await Class.findOne({
                where: {
                    title: title ? title.trim() : classEntity.title,
                    type: newType,
                    instructor_token: newInstructorToken,
                },
            })

            if (existingWithCombination && existingWithCombination.token !== token)
                throw generateHttpError("class_title_type_instructor_already_exists")
        }

        if (title) classEntity.title = title
        if (type) classEntity.type = type
        if (instructor_token) classEntity.instructor_token = instructor_token

        if (session_tokens && session_tokens.length > 0) {
            const sessions = await Session.find({ where: { token: In(session_tokens) } })
            if (sessions.length !== session_tokens.length) throw generateHttpError("invalid_session_tokens")
            classEntity.sessions = sessions
        }

        await classEntity.save()

        return true
    }
}

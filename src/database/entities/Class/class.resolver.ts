/* eslint-disable no-await-in-loop */
import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { In, Like } from "typeorm"

import { Admin } from "../Admin"
import { Personnel } from "../Personnel"
import { Price } from "../Price"
import { Session } from "../Session"
import { Class } from "./class.entity"
import {
    CreateClassRq,
    EditClassRq,
    FetchActiveClassListRq,
    FetchClassByTokenRq,
    FetchClassListRq,
    FetchClassPricesRq,
    ToggleClassStatus,
} from "./class.rq"
import { FetchActiveClassListRs, FetchClassListRs } from "./class.rs"

const dayOrder: { [key: string]: number } = {
    SAT: 0,
    SUN: 1,
    MON: 2,
    TUE: 3,
    WED: 4,
    THU: 5,
    FRI: 6,
}

const sortSessionsByDayAndTime = (sessions: Session[]): Session[] => {
    return sessions.sort((a, b) => {
        const dayDiff = dayOrder[a.day] - dayOrder[b.day]
        if (dayDiff !== 0) return dayDiff

        const aTime = a.time_period.from_time
        const bTime = b.time_period.from_time
        return aTime.localeCompare(bTime)
    })
}

@Resolver()
export class ClassResolver {
    @Query(() => [FetchClassListRs])
    @UseMiddleware([AuthMiddleware])
    async fetchClassList(
        @Arg("body") { title, type, instructor_token, is_active }: FetchClassListRq,
    ): Promise<FetchClassListRs[]> {
        const classes = await Class.find({
            where: {
                ...(title && { title: Like(`%${title.trim()}%`) }),
                ...(type && { type }),
                ...(instructor_token && { instructor_token }),
                ...(is_active !== undefined && is_active !== null && { is_active }),
            },
            relations: ["instructor", "prices"],
            order: {
                is_active: "DESC",
                created_at: "DESC",
            },
        })

        const result: FetchClassListRs[] = []

        for (const item of classes) {
            const sessions = await Session.find({ where: { token: In(item.session_tokens) } })
            result.push({ class: item, sessions: sortSessionsByDayAndTime(sessions) })
        }

        return result
    }

    @Query(() => [FetchActiveClassListRs])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveClassList(@Arg("body") { title }: FetchActiveClassListRq): Promise<FetchActiveClassListRs[]> {
        const classes = await Class.find({
            where: {
                ...(title && { title: Like(`%${title.trim()}%`) }),
                is_active: true,
            },
            relations: ["instructor", "prices"],
            order: {
                created_at: "DESC",
            },
        })

        const result: FetchClassListRs[] = []

        for (const item of classes) {
            const sessions = await Session.find({ where: { token: In(item.session_tokens) } })
            result.push({ class: item, sessions: sortSessionsByDayAndTime(sessions) })
        }

        return result
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

    // @Query(() => [ClassSessionPopulations])
    // @UseMiddleware([AuthMiddleware])
    // async fetchClassSessionPopulations(): Promise<ClassSessionPopulations[]> {
    //     const classes = await Class.find({
    //         where: { is_active: true },
    //         relations: ["sessions", "instructor"],
    //     })

    //     const result: ClassSessionPopulations[] = await Promise.all(
    //         classes.map(async classEntity => {
    //             const sessionPopulations: ClassSessionPopulation[] = await Promise.all(
    //                 classEntity.sessions.map(async session => {
    //                     // Find all registers for this class
    //                     const registers = await Register.find({
    //                         where: { class_token: classEntity.token },
    //                         select: ["token"],
    //                     })
    //                     const registerTokens = registers.map(r => r.token)

    //                     if (registerTokens.length === 0) {
    //                         return {
    //                             session_token: session.token,
    //                             session,
    //                             population_count: 0,
    //                         }
    //                     }

    //                     // Find all schedules with UNSET status for this session and these registers
    //                     const unsetSchedules = await Schedule.find({
    //                         where: {
    //                             register_token: In(registerTokens),
    //                             submission_session_token: session.token,
    //                             status: E_ScheduleStatus.UNSET,
    //                         },
    //                         select: ["register_token"],
    //                     })

    //                     // Count unique registrants (each register counted once regardless of how many UNSET schedules they have)
    //                     const uniqueRegisterTokens = [...new Set(unsetSchedules.map(s => s.register_token))]
    //                     const population_count = uniqueRegisterTokens.length

    //                     return {
    //                         session_token: session.token,
    //                         session,
    //                         population_count,
    //                     }
    //                 }),
    //             )

    //             const total_population = sessionPopulations.reduce((sum, sp) => sum + sp.population_count, 0)

    //             return {
    //                 class_token: classEntity.token,
    //                 class: classEntity,
    //                 sessions: sessionPopulations,
    //                 total_population,
    //             }
    //         }),
    //     )

    //     return result
    // }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async toggleClassStatus(@Arg("body") { token }: ToggleClassStatus): Promise<boolean> {
        const classEntity = await Class.createQueryBuilder("class")
            .where("class.token = :token", { token })
            .select(["class.token", "class.is_active"])
            .getOne()

        if (!classEntity) throw generateHttpError("class_not_found")

        await Class.createQueryBuilder()
            .update(Class)
            .set({ is_active: () => "NOT is_active" })
            .where("token = :token", { token })
            .execute()

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

        const existingClassWithCombination = await Class.findOne({ where: { title, type, instructor_token } })
        if (existingClassWithCombination) throw generateHttpError("class_title_type_instructor_already_exists")

        const classEntity = await Class.create({
            title,
            session_tokens,
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
        const classEntity = await Class.findOne({ where: { token } })
        if (!classEntity) throw generateHttpError("class_not_found")

        let instructor: Personnel

        const newType = type || classEntity.type
        const newInstructorToken = instructor_token || classEntity.instructor_token

        if (
            (title && title.trim() !== classEntity.title) ||
            (type && type !== classEntity.type) ||
            (instructor_token && instructor_token !== classEntity.instructor_token)
        ) {
            if (instructor_token) {
                instructor = await Personnel.findOne({ where: { token: instructor_token } })
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
        if (session_tokens) classEntity.session_tokens = session_tokens
        if (type) classEntity.type = type
        if (instructor_token) classEntity.instructor_token = instructor_token
        if (instructor_token) classEntity.instructor = instructor

        await classEntity.save()

        return true
    }

    @Query(() => FetchClassListRs)
    @UseMiddleware([AuthMiddleware])
    async fetchClassByToken(@Arg("body") { token }: FetchClassByTokenRq): Promise<FetchClassListRs> {
        const fetchedClass = await Class.findOne({ where: { token }, relations: ["instructor", "prices"] })
        const sessions = await Session.find({ where: { token: In(fetchedClass.session_tokens) } })

        const result: FetchClassListRs = { class: fetchedClass, sessions: sortSessionsByDayAndTime(sessions) }

        return result
    }
}

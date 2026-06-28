/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { In, Like } from "typeorm"

import { Admin } from "../Admin"
import { Personnel } from "../Personnel"
import { Price } from "../Price"
import { Register } from "../Register"
import { E_ScheduleStatus } from "../Schedule"
import { Session } from "../Session"
import { Class } from "./class.entity"
import {
    CreateClassRq,
    EditClassRq,
    FetchActiveClassListRq,
    FetchClassByTokenRq,
    FetchClassListRq,
    FetchClassPricesByTokenRq,
    FetchClassPricesRq,
    ToggleClassStatus,
} from "./class.rq"
import type { ClassSessionPopulation } from "./class.rs"
import { FetchActiveClassListRs, FetchClassByTokenRs, FetchClassListRs } from "./class.rs"

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

        const aTime = a.time_period?.from_time || ""
        const bTime = b.time_period?.from_time || ""
        return aTime.localeCompare(bTime)
    })
}

@Resolver()
export class ClassResolver {
    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async createClass(
        @Ctx("admin") admin: Admin,
        @Arg("body") { title, session_tokens, type, instructor_token }: CreateClassRq,
    ): Promise<boolean> {
        const instructor = await Personnel.findOne({ where: { token: instructor_token } })
        if (!instructor) throw generateHttpError("instructor_not_found")

        const existingWithCombination = await Class.findOne({
            where: { title: title.trim(), type, instructor_token },
        })
        if (existingWithCombination) throw generateHttpError("class_title_type_instructor_already_exists")

        await Class.create({
            title: title.trim(),
            session_tokens,
            type,
            instructor_token,
            instructor,
            admin_token: admin.token,
        }).save()

        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editClass(
        @Arg("body") { token, title, session_tokens, type, instructor_token }: EditClassRq,
    ): Promise<boolean> {
        const classEntity = await Class.findOne({ where: { token } })
        if (!classEntity) throw generateHttpError("class_not_found")

        let instructor: Personnel | null = null
        if (title || type || instructor_token) {
            const newType = type || classEntity.type
            const newInstructorToken = instructor_token || classEntity.instructor_token

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
        if (instructor_token && instructor) classEntity.instructor = instructor

        await classEntity.save()

        return true
    }

    @Query(() => [FetchClassListRs])
    @UseMiddleware([AuthMiddleware])
    async fetchClassList(@Arg("body", { nullable: true }) body?: FetchClassListRq): Promise<FetchClassListRs[]> {
        const whereConditions: Record<string, any> = {}

        if (body?.title) {
            whereConditions.title = Like(`%${body.title}%`)
        }

        if (body?.type) {
            whereConditions.type = body.type
        }

        if (body?.instructor_token) {
            whereConditions.instructor_token = body.instructor_token
        }

        if (body?.is_active !== undefined) {
            whereConditions.is_active = body.is_active
        }

        const classes = await Class.createQueryBuilder("class")
            .leftJoinAndSelect("class.instructor", "instructor")
            .leftJoinAndSelect("class.prices", "prices")
            .where(whereConditions)
            .orderBy("class.is_active", "DESC")
            .addOrderBy("class.type", "ASC")
            .addOrderBy("instructor.full_name", "ASC")
            .getMany()

        const result: FetchClassListRs[] = []

        for (const classEntity of classes) {
            const sessions = await Session.find({
                where: { token: In(classEntity.session_tokens) },
                relations: ["time_period"],
            })
            const sortedSessions = sortSessionsByDayAndTime(sessions)

            const registers = await Register.find({
                where: { class_token: classEntity.token },
                relations: ["user", "schedules"],
            })

            const sessionPopulations: ClassSessionPopulation[] = sortedSessions.map(session => {
                const namesOneRemaining: string[] = []
                const namesTwoRemaining: string[] = []
                const namesThreeOrMore: string[] = []
                let population_count = 0

                for (const reg of registers) {
                    if (!reg.user) continue

                    // 1. Get ONLY the UNSET schedules that belong strictly to THIS session
                    const sessionSpecificUnsetSchedules = (reg.schedules || []).filter(
                        s => s.status === E_ScheduleStatus.UNSET && s.submission_session_token === session.token,
                    )

                    const sessionUnsetCount = sessionSpecificUnsetSchedules.length

                    if (sessionUnsetCount > 0) {
                        population_count++ // User has active schedules here, increment population

                        // 2. Classify based on the counts SPECIFIC to this session
                        if (sessionUnsetCount === 1) {
                            namesOneRemaining.push(reg.user.full_name)
                        } else if (sessionUnsetCount === 2) {
                            namesTwoRemaining.push(reg.user.full_name)
                        } else if (sessionUnsetCount >= 3) {
                            namesThreeOrMore.push(reg.user.full_name)
                        }
                    }
                }

                return {
                    session_token: session.token,
                    session,
                    population_count,
                    one_remaining: {
                        count: namesOneRemaining.length,
                        user_names: namesOneRemaining,
                    },
                    two_remaining: {
                        count: namesTwoRemaining.length,
                        user_names: namesTwoRemaining,
                    },
                    at_least_three_remaining: {
                        count: namesThreeOrMore.length,
                        user_names: namesThreeOrMore,
                    },
                }
            })

            result.push({
                class: classEntity,
                sessions: sessionPopulations,
            })
        }

        return result
    }

    @Query(() => FetchClassByTokenRs)
    @UseMiddleware([AuthMiddleware])
    async fetchClassByToken(@Arg("body") { token }: FetchClassByTokenRq): Promise<FetchClassByTokenRs> {
        // FIX: Included 'prices' relation explicitly alongside instructor
        const fetchedClass = await Class.findOne({ where: { token }, relations: ["instructor", "prices"] })
        if (!fetchedClass) throw generateHttpError("class_not_found")

        const sessions = await Session.find({
            where: { token: In(fetchedClass.session_tokens) },
            relations: ["time_period"],
        })
        const sortedSessions = sortSessionsByDayAndTime(sessions)

        return {
            class: fetchedClass,
            sessions: sortedSessions,
        }
    }

    @Query(() => [FetchActiveClassListRs])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveClassList(
        @Arg("body", { nullable: true }) body?: FetchActiveClassListRq,
    ): Promise<FetchActiveClassListRs[]> {
        const title = body?.title

        // FIX: Included 'prices' relation to ensure active frontend widgets don't break when requesting prices array here
        const classes = await Class.find({
            where: {
                is_active: true,
                ...(title && { title: Like(`%${title}%`) }),
            },
            relations: ["instructor", "prices"],
            order: { title: "ASC" },
        })

        const result: FetchActiveClassListRs[] = []

        for (const classEntity of classes) {
            const sessions = await Session.find({
                where: { token: In(classEntity.session_tokens), is_active: true },
                relations: ["time_period"],
            })

            result.push({
                class: classEntity,
                sessions: sortSessionsByDayAndTime(sessions),
            })
        }

        return result
    }

    @Query(() => [Price])
    @UseMiddleware([AuthMiddleware])
    async fetchClassPrices(@Arg("body") { class_token, is_active }: FetchClassPricesRq): Promise<Price[]> {
        const prices = await Price.find({
            where: {
                class_token,
                ...(is_active !== undefined && { is_active }),
            },
            order: { created_at: "DESC" },
        })

        return prices
    }

    @Query(() => [Price])
    @UseMiddleware([AuthMiddleware])
    async fetchClassPricesByToken(@Arg("body") { token }: FetchClassPricesByTokenRq): Promise<Price[]> {
        const classEntity = await Class.findOne({ where: { token } })
        if (!classEntity) throw generateHttpError("class_not_found")

        const prices = await Price.find({
            where: {
                class_token: token,
                is_active: true,
            },
            relations: ["class"],
            order: { sessions_count: "ASC" },
        })

        return prices
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
}

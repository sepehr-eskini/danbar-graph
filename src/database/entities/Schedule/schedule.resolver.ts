/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { Admin, In } from "typeorm"

import { Personnel } from "../Personnel"
import { Register } from "../Register"
import { Session } from "../Session"
import { Schedule } from "./schedule.entity"
import { EditScheduleRq, FetchScheduleListRq, SetScheduleRq } from "./schedule.rq"
import { E_ScheduleStatus } from "./schedule.types"

@Resolver()
export class ScheduleResolver {
    @Query(() => [Schedule])
    @UseMiddleware([AuthMiddleware])
    async fetchSchedules(
        @Arg("body")
        {
            user_token,
            class_token,
            submission_date,
            submission_session_token,
            submission_instructor_token,
            status,
        }: FetchScheduleListRq,
    ): Promise<Schedule[]> {
        // Build where conditions for direct Schedule fields
        const whereConditions: Record<string, any> = {
            ...(submission_date && { submission_date }),
            ...(submission_session_token && { submission_session_token }),
            ...(submission_instructor_token && { submission_instructor_token }),
            ...(status && { status }),
        }

        // If user_token or class_token filters are provided, we need to join with Register
        if (user_token || class_token) {
            // Get registers matching the filters
            const registerWhereConditions: Record<string, any> = {}

            if (user_token) {
                registerWhereConditions.user_token = user_token
            }

            if (class_token) {
                registerWhereConditions.class_token = class_token
            }

            const matchingRegisters = await Register.find({
                where: registerWhereConditions,
            })

            // Extract register tokens from matching registers
            const registerTokens = matchingRegisters.map(reg => reg.token)

            // If no matching registers, return empty array
            if (registerTokens.length === 0) {
                return []
            }

            // Add register_token to where conditions for schedules
            whereConditions.register_token = In(registerTokens)
        }

        const schedules = await Schedule.find({
            where: whereConditions,
            relations: ["register", "register.user", "register.class"],
            order: { created_at: "DESC" },
        })

        return schedules
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async setSchedule(@Arg("body") { token, status }: SetScheduleRq): Promise<boolean> {
        const schedule = await Schedule.findOne({ where: { token } })
        if (!schedule) throw generateHttpError("schedule_not_found")

        schedule.status = status

        if (status === E_ScheduleStatus.PRESENT) {
            schedule.presence_date = schedule.submission_date
            schedule.presence_session_token = schedule.submission_session_token
            schedule.presence_instructor_token = schedule.submission_instructor_token
        }

        if (status !== E_ScheduleStatus.PRESENT) {
            schedule.presence_date = null
            schedule.presence_session_token = null
            schedule.presence_session = null
            schedule.presence_instructor_token = null
            schedule.presence_instructor = null
        }

        await schedule.save()

        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editSchedule(
        @Ctx("admin") admin: Admin,
        @Arg("body") { token, presence_date, presence_session_token, presence_instructor_token }: EditScheduleRq,
    ): Promise<boolean> {
        const schedule = await Schedule.findOne({ where: { token } })
        if (!schedule) throw generateHttpError("schedule_not_found")
        if (schedule.status !== E_ScheduleStatus.PRESENT && schedule.status !== E_ScheduleStatus.OFFSET)
            throw generateHttpError("internal_server_error")

        const presenceSession = await Session.findOne({ where: { token: presence_session_token } })
        const presenceInstructor = await Personnel.findOne({ where: { token: presence_instructor_token } })

        if (presence_date) schedule.presence_date = presence_date

        if (presence_session_token) {
            schedule.presence_session_token = presence_session_token
            schedule.presence_session = presenceSession
        }

        if (presence_instructor_token) {
            schedule.presence_instructor_token = presence_instructor_token
            schedule.presence_instructor = presenceInstructor
        }

        await schedule.save()

        return true
    }
}

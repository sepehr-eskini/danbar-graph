/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { Admin, In } from "typeorm"

import { Personnel } from "../Personnel"
import { Register } from "../Register"
import { Session } from "../Session"
import { Schedule } from "./schedule.entity"
import { EditScheduleRq, EditScheduleSubmissionRq, FetchScheduleListRq, SetScheduleRq } from "./schedule.rq"
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

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editScheduleSubmission(
        @Ctx("admin") admin: Admin,
        @Arg("body") { token, submission_date, submission_session_token }: EditScheduleSubmissionRq,
    ): Promise<boolean> {
        // Step 1: Fetch the schedule with its register
        const schedule = await Schedule.findOne({
            where: { token },
            relations: ["register"],
        })
        if (!schedule) throw generateHttpError("schedule_not_found")

        // Step 2: Get the register to access class information
        const register = await Register.findOne({
            where: { token: schedule.register_token },
            relations: ["class"],
        })
        if (!register) throw generateHttpError("register_not_found")

        // Step 3: Fetch all sessions for the class
        const allClassSessions = await Session.find()

        // Filter sessions that belong to the class (session_tokens should be in class.session_tokens)
        const classSessions = allClassSessions.filter(session => register.class.session_tokens.includes(session.token))

        // Step 4: Validate that the submission_session_token belongs to this class
        const selectedSession = classSessions.find(session => session.token === submission_session_token)
        if (!selectedSession) {
            throw generateHttpError("invalid_session_for_class")
        }

        // Step 5: Update schedule's submission details
        schedule.submission_date = submission_date
        schedule.submission_session_token = submission_session_token
        schedule.submission_instructor_token = register.class.instructor_token

        await schedule.save()

        // Step 6: Check if new submission_date is larger than register's last_schedule_date
        const newSubmissionDateMs = new Date(submission_date).getTime()
        const lastScheduleDateMs = new Date(register.last_schedule_date).getTime()

        // Step 7: If new date is larger, update register's last_schedule_date
        if (newSubmissionDateMs > lastScheduleDateMs) {
            register.last_schedule_date = submission_date
            await register.save()
        }

        return true
    }
}

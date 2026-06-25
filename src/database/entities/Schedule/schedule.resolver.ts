/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { Admin } from "typeorm"

import { Personnel } from "../Personnel"
import { Register } from "../Register"
import { Session } from "../Session"
import { Schedule } from "./schedule.entity"
import { EditScheduleRq, EditScheduleSubmissionRq, FetchScheduleListRq, SetScheduleRq } from "./schedule.rq"
import { FetchTomorrowSchedulesRs } from "./schedule.rs"
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
            payment_date,
        }: FetchScheduleListRq,
    ): Promise<Schedule[]> {
        // 1. Initialize QueryBuilder with alias 'schedule'
        const query = Schedule.createQueryBuilder("schedule")
            // Join and select Register relation paths
            .leftJoinAndSelect("schedule.register", "register")
            .leftJoinAndSelect("register.user", "user")
            .leftJoinAndSelect("register.class", "class")
            .leftJoinAndSelect("class.instructor", "class_instructor")

            // Join direct Schedule fields to satisfy { eager: true } properties
            // and prevent GraphQL "Cannot return null" crashes
            .leftJoinAndSelect("schedule.submission_instructor", "submission_instructor")
            .leftJoinAndSelect("schedule.submission_session", "submission_session")
            .leftJoinAndSelect("submission_session.time_period", "time_period")

        // 2. Apply filtering parameters for direct Schedule table fields
        if (submission_date) {
            query.andWhere("schedule.submission_date = :submission_date", { submission_date })
        }
        if (submission_session_token) {
            query.andWhere("schedule.submission_session_token = :submission_session_token", {
                submission_session_token,
            })
        }
        if (submission_instructor_token) {
            query.andWhere("schedule.submission_instructor_token = :submission_instructor_token", {
                submission_instructor_token,
            })
        }
        if (status) {
            query.andWhere("schedule.status = :status", { status })
        }

        // 3. Apply relational filtering parameters on the Register entity tables
        if (user_token) {
            query.andWhere("register.user_token = :user_token", { user_token })
        }
        if (class_token) {
            query.andWhere("register.class_token = :class_token", { class_token })
        }
        if (payment_date) {
            query.andWhere("register.payment_date = :payment_date", { payment_date })
        }

        // 4. Fetch the data from the database
        const schedules = await query.getMany()

        // 5. Apply runtime array sorting to prevent any background eager engine layout shuffling.
        return schedules.sort((a, b) => {
            const dateA = a.register?.created_at ? new Date(a.register.created_at).getTime() : 0
            const dateB = b.register?.created_at ? new Date(b.register.created_at).getTime() : 0

            // Primary Sort: register.created_at DESC
            if (dateB !== dateA) {
                return dateB - dateA
            }

            // Secondary Sort: schedule.submission_date ASC
            const subDateA = a.submission_date || ""
            const subDateB = b.submission_date || ""
            return subDateA.localeCompare(subDateB)
        })
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async setSchedule(@Arg("body") { token, status }: SetScheduleRq): Promise<boolean> {
        // Step 1: Fetch schedule with register relation
        const schedule = await Schedule.findOne({
            where: { token },
            relations: ["register"],
        })
        if (!schedule) throw generateHttpError("schedule_not_found")

        // Step 2: Update schedule status
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

        // Step 3: Update register's last_schedule_date based on non-canceled schedules
        const register = await Register.findOne({
            where: { token: schedule.register_token },
        })

        if (register) {
            // Get all schedules for this register
            const allSchedules = await Schedule.find({
                where: {
                    register_token: register.token,
                },
            })

            // Filter out CANCEL status schedules
            const nonCanceledSchedules = allSchedules.filter(sched => sched.status !== E_ScheduleStatus.CANCEL)

            // Find the latest submission_date from non-canceled schedules
            if (nonCanceledSchedules.length > 0) {
                const latestSchedule = nonCanceledSchedules.reduce((latest, current) => {
                    const latestDate = new Date(latest.submission_date).getTime()
                    const currentDate = new Date(current.submission_date).getTime()
                    return currentDate > latestDate ? current : latest
                })

                // Update register's last_schedule_date
                register.last_schedule_date = latestSchedule.submission_date
            } else {
                // If all schedules are canceled, set to null
                register.last_schedule_date = null
            }

            await register.save()
        }

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

        // Step 6: Calculate new last_schedule_date from non-canceled schedules
        // Get all schedules for this register
        const allSchedules = await Schedule.find({
            where: {
                register_token: register.token,
            },
        })

        // Filter out CANCEL status schedules
        const nonCanceledSchedules = allSchedules.filter(sched => sched.status !== E_ScheduleStatus.CANCEL)

        // Step 7: Find the latest submission_date from non-canceled schedules
        if (nonCanceledSchedules.length > 0) {
            const latestSchedule = nonCanceledSchedules.reduce((latest, current) => {
                const latestDate = new Date(latest.submission_date).getTime()
                const currentDate = new Date(current.submission_date).getTime()
                return currentDate > latestDate ? current : latest
            })

            // Update register's last_schedule_date
            register.last_schedule_date = latestSchedule.submission_date
        } else {
            // If all schedules are canceled, set to null
            register.last_schedule_date = null
        }

        await register.save()

        return true
    }

    @Query(() => [FetchTomorrowSchedulesRs])
    @UseMiddleware([AuthMiddleware])
    async fetchTomorrowSchedules(
        @Arg("body")
        {
            user_token,
            class_token,
            submission_date,
            submission_session_token,
            submission_instructor_token,
            status,
            payment_date,
        }: FetchScheduleListRq,
    ): Promise<FetchTomorrowSchedulesRs[]> {
        // 1. Calculate tomorrow's date representation in 'YYYY-MM-DD' format
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split("T")[0]

        // 2. Build the comprehensive query utilizing deep joins for all non-nullable relationships
        const query = Schedule.createQueryBuilder("schedule")
            // A. Join Register and its non-nullable relations
            .leftJoinAndSelect("schedule.register", "register")
            .leftJoinAndSelect("register.user", "user")
            .leftJoinAndSelect("register.price", "price")
            .leftJoinAndSelect("register.class", "class")

            // B. Join nested Class non-nullable relations (like its instructor personnel)
            .leftJoinAndSelect("class.instructor", "class_instructor")

            // C. Join directly assigned Schedule submission targets
            .leftJoinAndSelect("schedule.submission_instructor", "submission_instructor")
            .leftJoinAndSelect("schedule.submission_session", "submission_session")

            // D. Fix for time_period error: Join Session's mandatory inner relation
            .leftJoinAndSelect("submission_session.time_period", "time_period")

            // E. Optional/Nullable Presence joins (safe precaution to prevent graph issues if selected fields require them)
            .leftJoinAndSelect("schedule.presence_session", "presence_session")
            .leftJoinAndSelect("presence_session.time_period", "presence_time_period")
            .leftJoinAndSelect("schedule.presence_instructor", "presence_instructor")

            // Core Filters
            .where("schedule.submission_date = :tomorrowStr", { tomorrowStr })

        // Apply status parameter filtering or default fallback array mapping
        if (status) {
            query.andWhere("schedule.status = :status", { status })
        } else {
            // Allows fallback results matching UNSET, OFFSET, or PRESENT
            query.andWhere("schedule.status IN (:...statuses)", {
                statuses: [
                    E_ScheduleStatus.UNSET,
                    E_ScheduleStatus.OFFSET,
                    E_ScheduleStatus.PRESENT,
                    E_ScheduleStatus.ABSENT,
                ],
            })
        }

        // Apply incoming dynamic filters for Schedule table fields
        if (submission_date) {
            query.andWhere("schedule.submission_date = :submission_date", { submission_date })
        }
        if (submission_session_token) {
            query.andWhere("schedule.submission_session_token = :submission_session_token", {
                submission_session_token,
            })
        }
        if (submission_instructor_token) {
            query.andWhere("schedule.submission_instructor_token = :submission_instructor_token", {
                submission_instructor_token,
            })
        }

        // Apply incoming relational dynamic filters on the Register entity tables
        if (user_token) {
            query.andWhere("register.user_token = :user_token", { user_token })
        }
        if (class_token) {
            query.andWhere("register.class_token = :class_token", { class_token })
        }
        if (payment_date) {
            query.andWhere("register.payment_date = :payment_date", { payment_date })
        }

        // Sort by class title first, then by the class instructor's full name
        query.orderBy("class.title", "ASC").addOrderBy("class_instructor.full_name", "ASC")

        const schedules = await query.getMany()

        // 3. Map records safely to output structure
        return schedules.map(schedule => {
            const isLastSession = schedule.register?.last_schedule_date === tomorrowStr

            return {
                schedule,
                is_last_session: isLastSession,
            }
        })
    }
}

import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Schedule } from "./schedule.entity"
import { FetchScheduleListRq, SetScheduleRq } from "./schedule.rq"
import { E_ScheduleStatus } from "./schedule.types"

@Resolver()
export class ScheduleResolver {
    @Query(() => [Schedule])
    @UseMiddleware([AuthMiddleware])
    async fetchSchedules(
        @Arg("body")
        {
            register_token,
            submission_date,
            submission_session_token,
            submission_instructor_token,
            presence_date,
            presence_session_token,
            presence_instructor_token,
            status,
        }: FetchScheduleListRq,
    ): Promise<Schedule[]> {
        const schedules = await Schedule.find({
            where: {
                ...(register_token && { register_token }),
                ...(submission_date && { submission_date }),
                ...(submission_session_token && { submission_session_token }),
                ...(submission_instructor_token && { submission_instructor_token }),
                ...(presence_date && { presence_date }),
                ...(presence_session_token && { presence_session_token }),
                ...(presence_instructor_token && { presence_instructor_token }),
                ...(status && { status }),
            },
            relations: ["register", "register.user", "register.class"],
            order: { created_at: "DESC" },
        })

        return schedules
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async setSchedule(
        @Arg("body") { token, status, presence_date, presence_session_token, presence_instructor_token }: SetScheduleRq,
    ): Promise<boolean> {
        const schedule = await Schedule.findOne({ where: { token } })
        if (!schedule) throw generateHttpError("schedule_not_found")

        schedule.status = status

        if (presence_date && presence_session_token && presence_instructor_token) {
            schedule.presence_date = presence_date
            schedule.presence_session_token = presence_session_token
            schedule.presence_instructor_token = presence_instructor_token
        } else if (status === E_ScheduleStatus.PRESENT) {
            schedule.presence_date = schedule.submission_date
            schedule.presence_session_token = schedule.submission_session_token
            schedule.presence_instructor_token = schedule.submission_instructor_token
        }

        await schedule.save()

        return true
    }
}

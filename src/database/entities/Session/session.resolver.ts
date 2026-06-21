import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Admin } from "../Admin"
import { Session } from "./session.entity"
import { CreateSessionRq, FetchActiveSessionListRq, FetchSessionListRq, ToggleSessionStatus } from "./session.rq"

@Resolver()
export class SessionResolver {
    @Query(() => [Session])
    @UseMiddleware([AuthMiddleware])
    @Query(() => [Session])
    @UseMiddleware([AuthMiddleware])
    async fetchSessionList(@Arg("body") { day, time_period_token, is_active }: FetchSessionListRq): Promise<Session[]> {
        let query = Session.createQueryBuilder("session").leftJoinAndSelect("session.time_period", "time_period")

        if (day) query = query.andWhere("session.day = :day", { day })
        if (time_period_token)
            query = query.andWhere("session.time_period_token = :time_period_token", { time_period_token })
        if (is_active !== undefined && is_active !== null)
            query = query.andWhere("session.is_active = :is_active", { is_active })

        const sessions = await query
            .orderBy("session.is_active", "DESC")
            .addOrderBy(
                `CASE
            WHEN session.day = 'SAT' THEN 0
            WHEN session.day = 'SUN' THEN 1
            WHEN session.day = 'MON' THEN 2
            WHEN session.day = 'TUE' THEN 3
            WHEN session.day = 'WED' THEN 4
            WHEN session.day = 'THU' THEN 5
            WHEN session.day = 'FRI' THEN 6
        END`,
                "ASC",
            )
            .addOrderBy("time_period.from_time", "ASC")
            .getMany()

        return sessions
    }

    @Query(() => [Session])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveSessionList(
        @Arg("body") { day, time_period_token }: FetchActiveSessionListRq,
    ): Promise<Session[]> {
        let query = Session.createQueryBuilder("session")
            .leftJoinAndSelect("session.time_period", "time_period")
            .andWhere("session.is_active = :is_active", { is_active: true })

        if (day) query = query.andWhere("session.day = :day", { day })
        if (time_period_token)
            query = query.andWhere("session.time_period_token = :time_period_token", { time_period_token })

        const sessions = await query
            .orderBy(
                "CASE WHEN session.day = 'SAT' THEN 0 WHEN session.day = 'SUN' THEN 1 WHEN session.day = 'MON' THEN 2 WHEN session.day = 'TUE' THEN 3 WHEN session.day = 'WED' THEN 4 WHEN session.day = 'THU' THEN 5 WHEN session.day = 'FRI' THEN 6 END",
                "ASC",
            )
            .addOrderBy("time_period.from_time", "ASC")
            .getMany()

        return sessions
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async toggleSessionStatus(@Arg("body") { token }: ToggleSessionStatus): Promise<boolean> {
        const session = await Session.findOne({ where: { token } })
        if (!session) throw generateHttpError("session_not_found")

        session.is_active = !session.is_active
        await session.save()

        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async createSession(
        @Ctx("admin") admin: Admin,
        @Arg("body") { day, time_period_token }: CreateSessionRq,
    ): Promise<boolean> {
        const existingSession = await Session.findOne({ where: { day, time_period_token } })
        if (existingSession) throw generateHttpError("session_day_time_period_already_exists")

        const session = await Session.create({
            day,
            time_period_token,
            admin_token: admin.token,
        }).save()

        return !!session
    }
}

import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Admin } from "../Admin"
import { Session } from "./session.entity"
import { CreateSessionRq, FetchSessionListRq, ToggleSessionStatus } from "./session.rq"

@Resolver()
export class SessionResolver {
    @Query(() => [Session])
    @UseMiddleware([AuthMiddleware])
    async fetchSessionList(@Arg("body") { day, time_period_token }: FetchSessionListRq): Promise<Session[]> {
        const sessions = await Session.find({
            where: {
                ...(day && { day }),
                ...(time_period_token && { time_period_token }),
            },
            order: {
                is_active: "DESC",
                created_at: "DESC",
            },
        })

        return sessions
    }

    @Query(() => [Session])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveSessionList(@Arg("body") { day, time_period_token }: FetchSessionListRq): Promise<Session[]> {
        const sessions = await Session.find({
            where: {
                ...(day && { day }),
                ...(time_period_token && { time_period_token }),
                is_active: true,
            },
            order: { created_at: "DESC" },
        })

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

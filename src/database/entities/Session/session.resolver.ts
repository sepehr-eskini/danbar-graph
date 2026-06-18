import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Admin } from "../Admin"
import { TimePeriod } from "../TimePeriod/time-period.entity"
import { Session } from "./session.entity"
import { CreateSessionRq, FetchSessionListRq, ToggleSessionStatus } from "./session.rq"

@Resolver()
export class SessionResolver {
    @Query(() => [Session])
    @UseMiddleware([AuthMiddleware])
    async fetchSessions(@Arg("body") { day, time_period_token }: FetchSessionListRq): Promise<Session[]> {
        const sessions = await Session.find({
            where: {
                day: day || undefined,
                time_period: time_period_token ? { token: time_period_token } : undefined,
            },
            relations: ["time_period"],
            order: { day: "ASC", created_at: "DESC" },
        })

        return sessions
    }

    @Query(() => [Session])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveSessions(): Promise<Session[]> {
        const sessions = await Session.find({
            where: { is_active: true },
            relations: ["time_period"],
            order: { day: "ASC", created_at: "DESC" },
        })

        return sessions
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async toggleSessionStatus(@Arg("body") { token }: ToggleSessionStatus): Promise<boolean> {
        const session = await Session.findOne({
            where: { token },
            relations: ["time_period"],
        })
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
        // Validate time period exists
        const timePeriod = await TimePeriod.findOne({
            where: { token: time_period_token },
        })
        if (!timePeriod) throw generateHttpError("time_period_not_found")

        // Check for duplicate combination
        const existingSession = await Session.findOne({
            where: {
                day,
                time_period: { token: time_period_token },
            },
            relations: ["time_period"],
        })

        if (existingSession) {
            throw generateHttpError("session_day_time_period_already_exists")
        }

        // Create session
        const session = await Session.create({
            day,
            time_period: timePeriod,
            admin_token: admin.token,
            is_active: true,
        }).save()

        return !!session
    }
}

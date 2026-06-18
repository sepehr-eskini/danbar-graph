import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { In } from "typeorm"

import { Admin } from "../Admin"
import { Session } from "../Session/session.entity"
import { Class } from "./class.entity"
import { CreateClassRq, EditClassRq, FetchClassListRq, ToggleClassStatus } from "./class.rq"

@Resolver()
export class ClassResolver {
    @Query(() => [Class])
    @UseMiddleware([AuthMiddleware])
    async fetchClassList(@Arg("body") { title, type, price, session_token }: FetchClassListRq): Promise<Class[]> {
        let classes = await Class.find({
            where: {
                ...(title && { title: title.trim() }),
                ...(type && { type }),
                ...(price !== undefined && { price }),
            },
            relations: ["sessions"],
            order: { created_at: "DESC" },
        })

        if (session_token) {
            classes = classes.filter(classEntity =>
                classEntity.sessions.some(session => session.token === session_token),
            )
        }

        return classes
    }

    @Query(() => [Class])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveClassList(@Arg("body") { title, type, price, session_token }: FetchClassListRq): Promise<Class[]> {
        let classes = await Class.find({
            where: {
                is_active: true,
                ...(title && { title: title.trim() }),
                ...(type && { type }),
                ...(price !== undefined && { price }),
            },
            relations: ["sessions"],
            order: { created_at: "DESC" },
        })

        if (session_token) {
            classes = classes.filter(classEntity =>
                classEntity.sessions.some(session => session.token === session_token),
            )
        }

        return classes
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async toggleClassStatus(@Arg("body") { token }: ToggleClassStatus): Promise<boolean> {
        const classEntity = await Class.findOne({
            where: { token },
            relations: ["sessions"],
        })
        if (!classEntity) throw generateHttpError("class_not_found")

        classEntity.is_active = !classEntity.is_active
        await classEntity.save()

        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async createClass(
        @Ctx("admin") admin: Admin,
        @Arg("body") { title, session_tokens, type, price }: CreateClassRq,
    ): Promise<boolean> {
        const existingClassWithCombination = await Class.findOne({
            where: {
                title: title.trim(),
                type,
            },
            relations: ["sessions"],
        })
        if (existingClassWithCombination) {
            throw generateHttpError("class_title_type_already_exists")
        }

        const sessions = await Session.find({
            where: { token: In(session_tokens) },
        })

        if (sessions.length !== session_tokens.length) {
            throw generateHttpError("one_or_more_sessions_not_found")
        }

        const classEntity = await Class.create({
            title,
            sessions,
            type,
            price,
            admin_token: admin.token,
        }).save()

        return !!classEntity
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editClass(
        @Arg("body") { token, title, sessions: session_tokens, type, price }: EditClassRq,
    ): Promise<boolean> {
        const classEntity = await Class.findOne({
            where: { token },
            relations: ["sessions"],
        })
        if (!classEntity) throw generateHttpError("class_not_found")

        if ((title && title.trim() !== classEntity.title) || (type && type !== classEntity.type)) {
            const existingWithCombination = await Class.findOne({
                where: {
                    title: title ? title.trim() : classEntity.title,
                    type: type || classEntity.type,
                },
                relations: ["sessions"],
            })

            if (existingWithCombination && existingWithCombination.token !== token) {
                throw generateHttpError("class_title_type_already_exists")
            }
        }

        // Only add new sessions, don't remove existing ones
        if (session_tokens && session_tokens.length > 0) {
            // Get existing session tokens
            const existingSessionTokens = classEntity.sessions.map(s => s.token)

            // Filter out sessions that already exist
            const newSessionTokens = session_tokens.filter(token => !existingSessionTokens.includes(token))

            if (newSessionTokens.length > 0) {
                // Fetch the new sessions
                const newSessions = await Session.find({
                    where: { token: In(newSessionTokens) },
                })

                if (newSessions.length !== newSessionTokens.length) {
                    throw generateHttpError("one_or_more_sessions_not_found")
                }

                // Add new sessions to existing ones
                classEntity.sessions = [...classEntity.sessions, ...newSessions]
            }
        }

        // Update other fields
        if (title) classEntity.title = title
        if (type) classEntity.type = type
        if (price !== undefined) classEntity.price = price

        await classEntity.save()

        return true
    }
}

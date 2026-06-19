import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Admin } from "../Admin"
import { Class } from "./class.entity"
import { CreateClassRq, EditClassRq, FetchClassListRq, ToggleClassStatus } from "./class.rq"

@Resolver()
export class ClassResolver {
    @Query(() => [Class])
    @UseMiddleware([AuthMiddleware])
    async fetchClassList(@Arg("body") { title, type, price, sessions }: FetchClassListRq): Promise<Class[]> {
        const classes = await Class.find({
            where: {
                ...(title && { title: title.trim() }),
                ...(type && { type }),
                ...(price !== undefined && { price }),
                ...(sessions !== undefined && { sessions }),
            },
            order: { created_at: "DESC" },
        })

        return classes
    }

    @Query(() => [Class])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveClassList(@Arg("body") { title, type, price, sessions }: FetchClassListRq): Promise<Class[]> {
        const classes = await Class.find({
            where: {
                ...(title && { title: title.trim() }),
                ...(type && { type }),
                ...(price !== undefined && { price }),
                ...(sessions !== undefined && { sessions }),
                is_active: true,
            },
            order: { created_at: "DESC" },
        })

        return classes
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

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async createClass(
        @Ctx("admin") admin: Admin,
        @Arg("body") { title, sessions, type, price }: CreateClassRq,
    ): Promise<boolean> {
        const existingClassWithCombination = await Class.findOne({ where: { title, type, sessions } })
        if (existingClassWithCombination) throw generateHttpError("class_title_type_sessions_already_exists")

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
    async editClass(@Arg("body") { token, title, sessions, type, price }: EditClassRq): Promise<boolean> {
        const classEntity = await Class.findOne({ where: { token } })
        if (!classEntity) throw generateHttpError("class_not_found")

        const newType = type || classEntity.type
        const newSessions = sessions !== undefined ? sessions : classEntity.sessions

        if (
            (title && title.trim() !== classEntity.title) ||
            (type && type !== classEntity.type) ||
            (sessions !== undefined && sessions !== classEntity.sessions)
        ) {
            const existingWithCombination = await Class.findOne({
                where: {
                    title: title ? title.trim() : classEntity.title,
                    type: newType,
                    sessions: newSessions,
                },
            })

            if (existingWithCombination && existingWithCombination.token !== token)
                throw generateHttpError("class_title_type_sessions_already_exists")
        }

        if (title) classEntity.title = title
        if (sessions !== undefined) classEntity.sessions = sessions
        if (type) classEntity.type = type
        if (price !== undefined) classEntity.price = price

        await classEntity.save()

        return true
    }
}

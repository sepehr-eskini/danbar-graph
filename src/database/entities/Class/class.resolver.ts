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
    async fetchClassList(@Arg("body") { title, type, price }: FetchClassListRq): Promise<Class[]> {
        const classes = await Class.find({
            where: {
                ...(title && { title: title.trim() }),
                ...(type && { type }),
                ...(price !== undefined && { price }),
            },
            order: { created_at: "DESC" },
        })

        return classes
    }

    @Query(() => [Class])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveClassList(@Arg("body") { title, type, price }: FetchClassListRq): Promise<Class[]> {
        const classes = await Class.find({
            where: {
                ...(title && { title: title.trim() }),
                ...(type && { type }),
                ...(price !== undefined && { price }),
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
        @Arg("body") { title, session_tokens, type, price }: CreateClassRq,
    ): Promise<boolean> {
        const existingClassWithCombination = await Class.findOne({ where: { title, type } })
        if (existingClassWithCombination) throw generateHttpError("class_title_type_already_exists")

        const sessions = await Session.find({ where: { token: In(session_tokens) } })
        if (sessions.length !== session_tokens.length) throw generateHttpError("invalid_session_tokens")

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
    async editClass(@Arg("body") { token, title, session_tokens, type, price }: EditClassRq): Promise<boolean> {
        const classEntity = await Class.findOne({ where: { token }, relations: ["sessions"] })
        if (!classEntity) throw generateHttpError("class_not_found")

        const newType = type || classEntity.type

        if ((title && title.trim() !== classEntity.title) || (type && type !== classEntity.type)) {
            const existingWithCombination = await Class.findOne({
                where: {
                    title: title ? title.trim() : classEntity.title,
                    type: newType,
                },
            })

            if (existingWithCombination && existingWithCombination.token !== token)
                throw generateHttpError("class_title_type_already_exists")
        }

        if (title) classEntity.title = title
        if (type) classEntity.type = type
        if (price !== undefined) classEntity.price = price

        if (session_tokens && session_tokens.length > 0) {
            const sessions = await Session.find({ where: { token: In(session_tokens) } })
            if (sessions.length !== session_tokens.length) throw generateHttpError("invalid_session_tokens")
            classEntity.sessions = sessions
        }

        await classEntity.save()

        return true
    }
}

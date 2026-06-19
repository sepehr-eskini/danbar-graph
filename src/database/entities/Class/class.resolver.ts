import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { In } from "typeorm"

import { Admin } from "../Admin"
import { Personnel } from "../Personnel/personnel.entity"
import { Price } from "../Price/price.entity"
import { Session } from "../Session/session.entity"
import { Class } from "./class.entity"
import { CreateClassRq, EditClassRq, FetchClassListRq, FetchClassPricesRq, ToggleClassStatus } from "./class.rq"

@Resolver()
export class ClassResolver {
    @Query(() => [Class])
    @UseMiddleware([AuthMiddleware])
    async fetchClassList(@Arg("body") { title, type, price, instructor_token }: FetchClassListRq): Promise<Class[]> {
        const classes = await Class.find({
            where: {
                ...(title && { title: title.trim() }),
                ...(type && { type }),
                ...(price !== undefined && { price }),
                ...(instructor_token && { instructor_token }),
            },
            relations: ["sessions", "instructor", "prices"],
            order: { created_at: "DESC" },
        })

        return classes
    }

    @Query(() => [Class])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveClassList(
        @Arg("body") { title, type, price, instructor_token }: FetchClassListRq,
    ): Promise<Class[]> {
        const classes = await Class.find({
            where: {
                ...(title && { title: title.trim() }),
                ...(type && { type }),
                ...(price !== undefined && { price }),
                ...(instructor_token && { instructor_token }),
                is_active: true,
            },
            relations: ["sessions", "instructor", "prices"],
            order: { created_at: "DESC" },
        })

        return classes
    }

    @Query(() => [Price])
    @UseMiddleware([AuthMiddleware])
    async fetchClassPrices(@Arg("body") { class_token, is_active }: FetchClassPricesRq): Promise<Price[]> {
        const classEntity = await Class.findOne({ where: { token: class_token } })
        if (!classEntity) throw generateHttpError("class_not_found")

        const prices = await Price.find({
            where: {
                class_token,
                ...(is_active !== undefined && { is_active }),
            },
            order: { created_at: "DESC" },
        })

        return prices
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
        @Arg("body") { title, session_tokens, type, instructor_token, price }: CreateClassRq,
    ): Promise<boolean> {
        const instructor = await Personnel.findOne({ where: { token: instructor_token } })
        if (!instructor) throw generateHttpError("instructor_not_found")

        const existingClassWithCombination = await Class.findOne({
            where: { title, type, instructor_token },
        })
        if (existingClassWithCombination) throw generateHttpError("class_title_type_instructor_already_exists")

        const sessions = await Session.find({ where: { token: In(session_tokens) } })
        if (sessions.length !== session_tokens.length) throw generateHttpError("invalid_session_tokens")

        const classEntity = await Class.create({
            title,
            sessions,
            type,
            instructor_token,
            price,
            admin_token: admin.token,
        }).save()

        return !!classEntity
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editClass(
        @Arg("body") { token, title, session_tokens, type, instructor_token, price }: EditClassRq,
    ): Promise<boolean> {
        const classEntity = await Class.findOne({ where: { token }, relations: ["sessions"] })
        if (!classEntity) throw generateHttpError("class_not_found")

        const newType = type || classEntity.type
        const newInstructorToken = instructor_token || classEntity.instructor_token

        if (
            (title && title.trim() !== classEntity.title) ||
            (type && type !== classEntity.type) ||
            (instructor_token && instructor_token !== classEntity.instructor_token)
        ) {
            if (instructor_token) {
                const instructor = await Personnel.findOne({ where: { token: instructor_token } })
                if (!instructor) throw generateHttpError("instructor_not_found")
            }

            const existingWithCombination = await Class.findOne({
                where: {
                    title: title ? title.trim() : classEntity.title,
                    type: newType,
                    instructor_token: newInstructorToken,
                },
            })

            if (existingWithCombination && existingWithCombination.token !== token)
                throw generateHttpError("class_title_type_instructor_already_exists")
        }

        if (title) classEntity.title = title
        if (type) classEntity.type = type
        if (instructor_token) classEntity.instructor_token = instructor_token
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

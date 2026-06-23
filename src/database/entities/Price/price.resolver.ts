import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Admin } from "../Admin"
import { Class } from "../Class/class.entity"
import { Price } from "./price.entity"
import { CreatePriceRq, EditPriceRq, FetchActivePriceListRq, FetchPriceListRq, TogglePriceStatus } from "./price.rq"

@Resolver()
export class PriceResolver {
    @Query(() => [Price])
    @UseMiddleware([AuthMiddleware])
    async fetchPriceList(
        @Arg("body") { class_token, sessions_count, price, is_active }: FetchPriceListRq,
    ): Promise<Price[]> {
        const prices = await Price.find({
            where: {
                ...(class_token && { class_token }),
                ...(sessions_count !== undefined && { sessions_count }),
                ...(price !== undefined && { price }),
                ...(is_active !== undefined && is_active !== null && { is_active }),
            },
            relations: ["class"],
            order: {
                class: {
                    title: "DESC",
                    instructor: {
                        full_name: "DESC",
                    },
                    type: "DESC",
                },
                sessions_count: "DESC",
            },
        })

        return prices
    }

    @Query(() => [Price])
    @UseMiddleware([AuthMiddleware])
    async fetchActivePriceList(@Arg("body") { sessions_count }: FetchActivePriceListRq): Promise<Price[]> {
        const prices = await Price.find({
            where: {
                ...(sessions_count !== undefined && { sessions_count }),
                is_active: true,
            },
            relations: ["class"],
            order: {
                created_at: "DESC",
            },
        })

        return prices
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async togglePriceStatus(@Arg("body") { token }: TogglePriceStatus): Promise<boolean> {
        const priceEntity = await Price.findOne({ where: { token } })
        if (!priceEntity) throw generateHttpError("price_not_found")

        priceEntity.is_active = !priceEntity.is_active
        await priceEntity.save()

        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async createPrice(
        @Ctx("admin") admin: Admin,
        @Arg("body") { class_token, sessions_count, price, is_active }: CreatePriceRq,
    ): Promise<boolean> {
        const classEntity = await Class.findOne({ where: { token: class_token } })
        if (!classEntity) throw generateHttpError("class_not_found")

        const existingPrice = await Price.findOne({
            where: { sessions_count, price },
        })
        if (existingPrice) throw generateHttpError("price_sessions_count_price_already_exists")

        const priceEntity = await Price.create({
            class_token,
            sessions_count,
            price,
            is_active: is_active ?? true,
            admin_token: admin.token,
        }).save()

        return !!priceEntity
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editPrice(@Arg("body") { token, sessions_count, price }: EditPriceRq): Promise<boolean> {
        const priceEntity = await Price.findOne({ where: { token } })
        if (!priceEntity) throw generateHttpError("price_not_found")

        const newSessionsCount = sessions_count !== undefined ? sessions_count : priceEntity.sessions_count
        const newPrice = price !== undefined ? price : priceEntity.price

        if (
            (sessions_count !== undefined && sessions_count !== priceEntity.sessions_count) ||
            (price !== undefined && price !== priceEntity.price)
        ) {
            const existingWithCombination = await Price.findOne({
                where: {
                    sessions_count: newSessionsCount,
                    price: newPrice,
                },
            })

            if (existingWithCombination && existingWithCombination.token !== token)
                throw generateHttpError("price_sessions_count_price_already_exists")
        }

        if (sessions_count !== undefined) priceEntity.sessions_count = sessions_count
        if (price !== undefined) priceEntity.price = price

        await priceEntity.save()

        return true
    }
}

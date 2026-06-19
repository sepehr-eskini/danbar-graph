import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Admin } from "../Admin"
import { Class } from "../Class/class.entity"
import { Price } from "../Price/price.entity"
import { Schedule } from "../Schedule/schedule.entity"
import { E_ScheduleStatus } from "../Schedule/schedule.types"
import { User } from "../User/user.entity"
import { Register } from "./register.entity"
import { CreateRegisterRq, EditRegisterRq, FetchRegisterListRq } from "./register.rq"

@Resolver()
export class RegisterResolver {
    @Query(() => [Register])
    @UseMiddleware([AuthMiddleware])
    async fetchRegisters(
        @Arg("body") { user_token, class_token, price_token, payment_date, admin_token }: FetchRegisterListRq,
    ): Promise<Register[]> {
        const registers = await Register.find({
            where: {
                ...(user_token && { user_token }),
                ...(class_token && { class_token }),
                ...(price_token && { price_token }),
                ...(payment_date && { payment_date }),
                ...(admin_token && { admin_token }),
            },
            relations: ["user", "class", "price", "schedules"],
            order: { created_at: "DESC" },
        })

        return registers
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async createRegister(
        @Ctx("admin") admin: Admin,
        @Arg("body")
        {
            user_token,
            class_token,
            price_token,
            payment_date,
            payment_price,
            calendar_image_url,
            submission_date,
            submission_session_token,
        }: CreateRegisterRq,
    ): Promise<boolean> {
        const user = await User.findOne({ where: { token: user_token } })
        if (!user) throw generateHttpError("user_not_found")

        const classEntity = await Class.findOne({ where: { token: class_token } })
        if (!classEntity) throw generateHttpError("class_not_found")

        const price = await Price.findOne({ where: { token: price_token } })
        if (!price) throw generateHttpError("price_not_found")

        const register = await Register.create({
            user_token,
            class_token,
            price_token,
            payment_date,
            payment_price,
            calendar_image_url,
            admin_token: admin.token,
        }).save()

        // Bulk create sessions_count number of schedules
        const schedules = Array.from({ length: price.sessions_count }, () =>
            Schedule.create({
                register_token: register.token,
                submission_date,
                submission_session_token,
                submission_instructor_token: classEntity.instructor_token,
                status: E_ScheduleStatus.UNSET,
            }),
        )

        await Schedule.save(schedules)

        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editRegister(@Arg("body") { token, payment_date, payment_price }: EditRegisterRq): Promise<boolean> {
        const register = await Register.findOne({ where: { token } })
        if (!register) throw generateHttpError("register_not_found")

        if (payment_date) register.payment_date = payment_date
        if (payment_price !== undefined) register.payment_price = payment_price

        await register.save()

        return true
    }
}

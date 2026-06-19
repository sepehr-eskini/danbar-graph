import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Admin } from "../Admin"
import { Class } from "../Class"
import { Price } from "../Price"
import { E_ScheduleStatus, Schedule } from "../Schedule"
import { User } from "../User"
import { Register } from "./register.entity"
import { CreateRegisterRq, EditRegisterRq, FetchRegisterListRq } from "./register.rq"
import { UserWithUnsetScheduleInfo } from "./register.rs"

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
            submissions,
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

        // Create schedules and save them with Promise.all
        const schedulePromises = Array.from({ length: price.sessions_count }, (_, index) => {
            const schedule = Schedule.create({
                register_token: register.token,
                submission_date: submissions[index]?.date,
                submission_session_token: submissions[index]?.session_token,
                submission_instructor_token: classEntity.instructor_token,
                status: E_ScheduleStatus.UNSET,
            })
            return schedule.save()
        })

        await Promise.all(schedulePromises)

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

    @Query(() => [UserWithUnsetScheduleInfo])
    @UseMiddleware([AuthMiddleware])
    async getUsersWithUnsetScheduleInfo(): Promise<UserWithUnsetScheduleInfo[]> {
        const users = await User.find({
            relations: ["registers", "registers.schedules", "registers.class"],
        })

        return users
            .map(user => {
                const unsetSchedules =
                    user.registers?.flatMap(r => r.schedules || []).filter(s => s.status === E_ScheduleStatus.UNSET) ||
                    []

                const latestUnset =
                    unsetSchedules.length > 0
                        ? unsetSchedules.reduce((a, b) =>
                              new Date(a.submission_date) > new Date(b.submission_date) ? a : b,
                          )
                        : null

                const register = latestUnset
                    ? user.registers?.find(r => r.schedules?.some(s => s.token === latestUnset.token))
                    : null

                return {
                    user,
                    unset_count: unsetSchedules.length,
                    last_unset_class: register?.class || null,
                    last_unset_submission_date: latestUnset?.submission_date || null,
                }
            })
            .sort((a, b) => a.unset_count - b.unset_count)
    }
}

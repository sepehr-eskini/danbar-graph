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
        @Arg("body")
        { user_token, class_token, price_token, payment_date, admin_token, last_schedule_date }: FetchRegisterListRq,
    ): Promise<Register[]> {
        const registers = await Register.find({
            where: {
                ...(user_token && { user_token }),
                ...(class_token && { class_token }),
                ...(price_token && { price_token }),
                ...(payment_date && { payment_date }),
                ...(admin_token && { admin_token }),
                ...(last_schedule_date && { last_schedule_date }),
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
            discount_price,
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

        // Sort submissions by date and get the last one
        const sortedSubmissions = [...submissions].sort((a, b) => {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            return dateB - dateA // Descending order (latest first)
        })

        const lastScheduleDate = sortedSubmissions[0]?.date

        const register = await Register.create({
            user_token,
            class_token,
            price_token,
            payment_date,
            payment_price,
            discount_price,
            calendar_image_url,
            last_schedule_date: lastScheduleDate,
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
    async editRegister(
        @Arg("body") { token, payment_date, payment_price, discount_price }: EditRegisterRq,
    ): Promise<boolean> {
        const register = await Register.findOne({ where: { token } })
        if (!register) throw generateHttpError("register_not_found")

        if (payment_date) register.payment_date = payment_date
        if (payment_price !== undefined) register.payment_price = payment_price
        if (discount_price !== undefined) register.discount_price = discount_price

        await register.save()

        return true
    }

    @Query(() => [UserWithUnsetScheduleInfo])
    @UseMiddleware([AuthMiddleware])
    async fetchUsersWithCompletedSchedules(): Promise<UserWithUnsetScheduleInfo[]> {
        // Get all active users
        const users = await User.find({
            where: { is_active: true },
        })

        // For each user, check if they have schedules but no unset ones
        const result: UserWithUnsetScheduleInfo[] = await Promise.all(
            users.map(async user => {
                // Find all registers for this user with their related schedules and class
                const registers = await Register.find({
                    where: { user_token: user.token },
                    relations: ["class", "schedules"],
                })

                // Get all schedules (not just unset)
                const allSchedules = registers.flatMap(register =>
                    (register.schedules || []).map(schedule => ({ ...schedule, register })),
                )

                // Get unset schedules
                const unsetSchedules = allSchedules.filter(schedule => schedule.status === E_ScheduleStatus.UNSET)

                // Only include users who have schedules but no unset ones (completed all)
                if (allSchedules.length === 0 || unsetSchedules.length > 0) {
                    return null
                }

                // Find the most recent schedule by submission_date (last class they attended)
                const lastSchedule = allSchedules.reduce((latest, current) => {
                    const latestDate = new Date(latest.submission_date).getTime()
                    const currentDate = new Date(current.submission_date).getTime()
                    return currentDate > latestDate ? current : latest
                })

                return {
                    user,
                    unset_count: 0,
                    last_unset_class: lastSchedule.register.class,
                    last_unset_submission_date: lastSchedule.submission_date,
                }
            }),
        )

        // Filter out null values and sort by last submission date (most recent first)
        return result
            .filter((item): item is UserWithUnsetScheduleInfo => item !== null)
            .sort((a, b) => {
                const dateA = new Date(a.last_unset_submission_date || "").getTime()
                const dateB = new Date(b.last_unset_submission_date || "").getTime()
                return dateB - dateA
            })
    }

    @Query(() => [UserWithUnsetScheduleInfo])
    @UseMiddleware([AuthMiddleware])
    async fetchUsersWithUnsetScheduleInfo(): Promise<UserWithUnsetScheduleInfo[]> {
        // Get all active users
        const users = await User.find({
            where: { is_active: true },
        })

        // For each user, get their unset schedules efficiently
        const result: UserWithUnsetScheduleInfo[] = await Promise.all(
            users.map(async user => {
                // Find all registers for this user with their related schedules and class
                const registers = await Register.find({
                    where: { user_token: user.token },
                    relations: ["class", "schedules"],
                })

                // Flatten all unset schedules from all registers
                const unsetSchedules = registers.flatMap(register =>
                    (register.schedules || [])
                        .filter(schedule => schedule.status === E_ScheduleStatus.UNSET)
                        .map(schedule => ({ ...schedule, register })),
                )

                if (unsetSchedules.length === 0) {
                    return {
                        user,
                        unset_count: 0,
                        last_unset_class: null,
                        last_unset_submission_date: null,
                    }
                }

                const latestUnset = unsetSchedules.reduce((latest, current) => {
                    const latestDate = new Date(latest.submission_date).getTime()
                    const currentDate = new Date(current.submission_date).getTime()
                    return currentDate > latestDate ? current : latest
                })

                return {
                    user,
                    unset_count: unsetSchedules.length,
                    last_unset_class: latestUnset.register.class,
                    last_unset_submission_date: latestUnset.submission_date,
                }
            }),
        )

        // Filter out users with no unset schedules and sort by unset_count (descending - most unset first)
        return result.filter(item => item.unset_count > 0).sort((a, b) => b.unset_count - a.unset_count)
    }
}

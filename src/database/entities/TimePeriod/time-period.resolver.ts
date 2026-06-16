import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Admin } from "../Admin"
import { TimePeriod } from "./time-period.entity"
import { CreateTimePeriodRq, EditTimePeriodRq, ToggleTimePeriodStatus } from "./time-period.rq"

@Resolver()
export class TimePeriodResolver {
    @Query(() => [TimePeriod])
    @UseMiddleware([AuthMiddleware])
    async fetchTimePeriodList(): Promise<TimePeriod[]> {
        const timePeriods = await TimePeriod.find({ order: { from_time: "ASC", to_time: "ASC" } })

        return timePeriods
    }

    @Query(() => [TimePeriod])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveTimePeriodList(): Promise<TimePeriod[]> {
        const timePeriods = await TimePeriod.find({
            where: { is_active: true },
            order: { from_time: "ASC", to_time: "ASC" },
        })

        return timePeriods
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async toggleTimePeriodStatus(@Arg("body") { token }: ToggleTimePeriodStatus): Promise<boolean> {
        const timePeriod = await TimePeriod.findOne({ where: { token } })
        if (!timePeriod) throw generateHttpError("time_period_not_found")

        timePeriod.is_active = !timePeriod.is_active
        await timePeriod.save()

        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async createTimePeriod(
        @Ctx("admin") admin: Admin,
        @Arg("body") { title, from_time, to_time }: CreateTimePeriodRq,
    ): Promise<boolean> {
        // Validate time format (HH:MM or HH:MM:SS)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
        if (!timeRegex.test(from_time) || !timeRegex.test(to_time)) throw generateHttpError("invalid_time_format")

        const fromTimeParts = from_time.split(":").map(Number)
        const toTimeParts = to_time.split(":").map(Number)
        const fromMinutes = fromTimeParts[0] * 60 + fromTimeParts[1]
        const toMinutes = toTimeParts[0] * 60 + toTimeParts[1]
        if (fromMinutes >= toMinutes) throw generateHttpError("invalid_time_format")

        const existingTimePeriodWithTitle = await TimePeriod.findOne({ where: { title } })
        if (existingTimePeriodWithTitle) throw generateHttpError("time_period_title_already_exists")

        const existingTimePeriodWithPair = await TimePeriod.findOne({ where: { from_time, to_time } })
        if (existingTimePeriodWithPair) throw generateHttpError("time_period_pair_already_exists")

        const timePeriod = await TimePeriod.create({
            title,
            from_time,
            to_time,
            admin_token: admin.token,
        }).save()

        return !!timePeriod
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editTimePeriod(@Arg("body") { token, title, from_time, to_time }: EditTimePeriodRq): Promise<boolean> {
        const timePeriod = await TimePeriod.findOne({ where: { token } })
        if (!timePeriod) throw generateHttpError("time_period_not_found")

        if (from_time || to_time) {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
            if (from_time && !timeRegex.test(from_time)) throw generateHttpError("invalid_time_format")
            if (to_time && !timeRegex.test(to_time)) throw generateHttpError("invalid_time_format")

            const fromTimeToCheck = from_time || timePeriod.from_time
            const toTimeToCheck = to_time || timePeriod.to_time

            const fromTimeParts = fromTimeToCheck.split(":").map(Number)
            const toTimeParts = toTimeToCheck.split(":").map(Number)

            const fromMinutes = fromTimeParts[0] * 60 + fromTimeParts[1]
            const toMinutes = toTimeParts[0] * 60 + toTimeParts[1]

            if (fromMinutes >= toMinutes) throw generateHttpError("invalid_time_format")
        }

        if (title && title !== timePeriod.title) {
            const existingWithTitle = await TimePeriod.findOne({ where: { title } })
            if (existingWithTitle) throw generateHttpError("time_period_title_already_exists")
        }

        if ((from_time && from_time !== timePeriod.from_time) || (to_time && to_time !== timePeriod.to_time)) {
            const newFromTime = from_time || timePeriod.from_time
            const newToTime = to_time || timePeriod.to_time

            const existingWithPair = await TimePeriod.findOne({
                where: {
                    from_time: newFromTime,
                    to_time: newToTime,
                },
            })

            if (existingWithPair && existingWithPair.token !== token) {
                throw generateHttpError("time_period_pair_already_exists")
            }
        }

        if (title) timePeriod.title = title
        if (from_time) timePeriod.from_time = from_time
        if (to_time) timePeriod.to_time = to_time

        await timePeriod.save()

        return true
    }
}

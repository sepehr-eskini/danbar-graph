import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { Like } from "typeorm"

import { Admin } from "../Admin"
import { Personnel } from "./personnel.entity"
import {
    CreatePersonnelRq,
    EditPersonnelRq,
    FetchActivePersonnelListRq,
    FetchPersonnelListRq,
    TogglePersonnelStatus,
} from "./personnel.rq"

@Resolver()
export class PersonnelResolver {
    @Query(() => [Personnel])
    @UseMiddleware([AuthMiddleware])
    async fetchPersonnelList(
        @Arg("body") { full_name, phone_number, is_active }: FetchPersonnelListRq,
    ): Promise<Personnel[]> {
        const personnel = await Personnel.find({
            where: {
                ...(full_name && { full_name: Like(`%${full_name.trim()}%`) }),
                ...(phone_number && { phone_number: Like(`%${phone_number}%`) }),
                ...(is_active !== undefined && is_active !== null && { is_active }),
            },
            order: {
                is_active: "DESC",
                created_at: "DESC",
            },
        })

        return personnel
    }

    @Query(() => [Personnel])
    @UseMiddleware([AuthMiddleware])
    async fetchActivePersonnelList(@Arg("body") { full_name }: FetchActivePersonnelListRq): Promise<Personnel[]> {
        const personnel = await Personnel.find({
            where: {
                ...(full_name && { full_name: Like(`%${full_name.trim()}%`) }),
                is_active: true,
            },
            order: { created_at: "DESC" },
        })

        return personnel
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async togglePersonnelStatus(@Arg("body") { token }: TogglePersonnelStatus): Promise<boolean> {
        const personnel = await Personnel.findOne({ where: { token } })
        if (!personnel) throw generateHttpError("personnel_not_found")

        personnel.is_active = !personnel.is_active
        await personnel.save()

        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async createPersonnel(
        @Ctx("admin") admin: Admin,
        @Arg("body")
        { full_name, phone_number, income_percentage = 0, fixed_income_price = 0 }: CreatePersonnelRq,
    ): Promise<boolean> {
        const existingPersonnelWithPhoneNumber = await Personnel.findOne({ where: { phone_number } })
        if (existingPersonnelWithPhoneNumber) throw generateHttpError("personnel_phone_number_already_exists")

        const existingPersonnelWithFullName = await Personnel.findOne({ where: { full_name } })
        if (existingPersonnelWithFullName) throw generateHttpError("personnel_full_name_already_exists")

        const personnel = await Personnel.create({
            full_name,
            phone_number,
            income_percentage,
            fixed_income_price,
            admin_token: admin.token,
        }).save()

        return !!personnel
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editPersonnel(
        @Arg("body") { token, full_name, phone_number, income_percentage, fixed_income_price }: EditPersonnelRq,
    ): Promise<boolean> {
        const personnel = await Personnel.findOne({ where: { token } })
        if (!personnel) throw generateHttpError("personnel_not_found")

        if (phone_number && phone_number !== personnel.phone_number) {
            const existingWithPhone = await Personnel.findOne({ where: { phone_number } })
            if (existingWithPhone) throw generateHttpError("personnel_phone_number_already_exists")
        }

        if (full_name && full_name !== personnel.full_name) {
            const existingWithFullName = await Personnel.findOne({ where: { full_name } })
            if (existingWithFullName) throw generateHttpError("personnel_full_name_already_exists")
        }

        if (full_name) personnel.full_name = full_name
        if (phone_number) personnel.phone_number = phone_number
        if (income_percentage !== undefined) personnel.income_percentage = income_percentage
        if (fixed_income_price !== undefined) personnel.fixed_income_price = fixed_income_price

        await personnel.save()

        return true
    }
}

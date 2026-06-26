import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"
import { Like } from "typeorm"

import { Admin } from "../Admin"
import { User } from "./user.entity"
import { CreateUserRq, EditUserRq, FetchActiveUsersListRq, FetchUsersListRq, ToggleUserStatus } from "./user.rq"

@Resolver()
export class UserResolver {
    @Query(() => [User])
    @UseMiddleware([AuthMiddleware])
    async fetchUsersList(@Arg("body") { full_name, phone_number, is_active }: FetchUsersListRq): Promise<User[]> {
        const users = await User.find({
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

        return users
    }

    @Query(() => [User])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveUsersList(@Arg("body") { full_name }: FetchActiveUsersListRq): Promise<User[]> {
        const users = await User.find({
            where: {
                ...(full_name && { full_name: Like(`%${full_name.trim()}%`) }),
                is_active: true,
            },
            order: { created_at: "DESC" },
        })

        return users
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async toggleUserStatus(@Arg("body") { token }: ToggleUserStatus): Promise<boolean> {
        const user = await User.findOne({ where: { token } })
        if (!user) return false

        user.is_active = !user.is_active
        await user.save()

        return true
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async createUser(
        @Ctx("admin") admin: Admin,
        @Arg("body")
        { full_name, phone_number }: CreateUserRq,
    ): Promise<boolean> {
        // FIX: Only validate unique phone number if it is a non-empty string
        if (phone_number) {
            const existingUserWithPhoneNumber = await User.findOne({ where: { phone_number } })
            if (existingUserWithPhoneNumber) throw generateHttpError("user_phone_number_already_exists")
        }

        const existingUserWithFullName = await User.findOne({ where: { full_name } })
        if (existingUserWithFullName) throw generateHttpError("user_full_name_already_exists")

        const user = await User.create({
            full_name,
            // FIX: If phone_number is null, store it as null instead of dropping the property
            phone_number: phone_number === "" ? null : phone_number || null,
            admin_token: admin.token,
        }).save()

        return !!user
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editUser(@Arg("body") { token, full_name, phone_number }: EditUserRq): Promise<boolean> {
        const user = await User.findOne({ where: { token } })
        if (!user) throw generateHttpError("user_not_found")

        // FIX: Only perform duplicate check if phone_number is an actual string value and has changed
        if (phone_number && phone_number !== user.phone_number) {
            const existingUserWithPhoneNumber = await User.findOne({ where: { phone_number } })
            if (existingUserWithPhoneNumber) throw generateHttpError("user_phone_number_already_exists")
        }

        if (full_name && full_name !== user.full_name) {
            const existingUserWithFullName = await User.findOne({ where: { full_name } })
            if (existingUserWithFullName) throw generateHttpError("user_full_name_already_exists")
        }

        if (full_name) user.full_name = full_name

        // FIX: Explicitly handle undefined vs null.
        // If it's explicitly null or an empty string, set the database column to null.
        if (phone_number !== undefined) {
            user.phone_number = phone_number === "" ? null : phone_number
        }

        await user.save()

        return true
    }
}

import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

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
                ...(full_name && { full_name: full_name.trim() }),
                ...(phone_number && { phone_number }),
                ...(is_active && { is_active }),
            },
            order: { created_at: "DESC" },
        })

        return users
    }

    @Query(() => [User])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveUsersList(@Arg("body") { full_name, phone_number }: FetchActiveUsersListRq): Promise<User[]> {
        const users = await User.find({
            where: {
                ...(full_name && { full_name: full_name.trim() }),
                ...(phone_number && { phone_number }),
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
        const existingUserWithPhoneNumber = await User.findOne({ where: { phone_number } })
        if (existingUserWithPhoneNumber) throw generateHttpError("user_phone_number_already_exists")

        const existingUserWithFullName = await User.findOne({ where: { full_name } })
        if (existingUserWithFullName) throw generateHttpError("user_full_name_already_exists")

        const user = await User.create({ full_name, phone_number, admin_token: admin.token }).save()

        return !!user
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editUser(@Arg("body") { token, full_name, phone_number }: EditUserRq): Promise<boolean> {
        const user = await User.findOne({ where: { token } })
        if (!user) throw generateHttpError("user_not_found")

        const existingUserWithPhoneNumber = await User.findOne({ where: { phone_number } })
        if (existingUserWithPhoneNumber) throw generateHttpError("user_phone_number_already_exists")

        const existingUserWithFullName = await User.findOne({ where: { full_name } })
        if (existingUserWithFullName) throw generateHttpError("user_full_name_already_exists")

        if (full_name) user.full_name = full_name
        if (phone_number) user.phone_number = phone_number

        await user.save()

        return true
    }
}

import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Admin } from "../Admin"
import { User } from "./user.entity"
import { CreateUserRq, EditUserRq, FetchUsersListRq, ToggleUserStatus } from "./user.rq"

@Resolver()
export class UserResolver {
    @Query(() => [User])
    @UseMiddleware([AuthMiddleware])
    async fetchUsersList(@Arg("body") { fullname, phone_number }: FetchUsersListRq): Promise<User[]> {
        const users = await User.find({
            where: {
                ...(fullname && { fullname: fullname.trim() }),
                ...(phone_number && { phone_number }),
            },
            order: { created_at: "DESC" },
        })

        return users
    }

    @Query(() => [User])
    @UseMiddleware([AuthMiddleware])
    async fetchActiveUsersList(@Arg("body") { fullname, phone_number }: FetchUsersListRq): Promise<User[]> {
        const users = await User.find({
            where: {
                ...(fullname && { fullname: fullname.trim() }),
                ...(phone_number && { phone_number }),
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
        { fullname, phone_number }: CreateUserRq,
    ): Promise<boolean> {
        const existingUserWithPhoneNumber = await User.findOne({ where: { phone_number } })
        if (existingUserWithPhoneNumber) throw generateHttpError("user_phone_number_already_exists")

        const existingUserWithFullname = await User.findOne({ where: { fullname } })
        if (existingUserWithFullname) throw generateHttpError("user_fullname_already_exists")

        const user = await User.create({ fullname, phone_number, admin_token: admin.token }).save()

        return !!user
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editUser(@Arg("body") { token, fullname, phone_number }: EditUserRq): Promise<boolean> {
        const user = await User.findOne({ where: { token } })
        if (!user) throw generateHttpError("user_not_found")

        const existingUserWithPhoneNumber = await User.findOne({ where: { phone_number } })
        if (existingUserWithPhoneNumber) throw generateHttpError("user_phone_number_already_exists")

        const existingUserWithFullname = await User.findOne({ where: { fullname } })
        if (existingUserWithFullname) throw generateHttpError("user_fullname_already_exists")

        if (fullname) user.fullname = fullname
        if (phone_number) user.phone_number = phone_number

        await user.save()

        return true
    }
}

import { generateHttpError } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

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
        @Arg("body")
        { fullname, phone_number }: CreateUserRq,
    ): Promise<boolean> {
        const existingUser = await User.findOne({ where: { phone_number } })
        if (existingUser) throw generateHttpError("user_phone_number_already_exists")

        const user = await User.create({ fullname, phone_number }).save()

        return !!user
    }

    @Mutation(() => Boolean)
    @UseMiddleware([AuthMiddleware])
    async editUser(@Arg("body") { token, fullname, phone_number }: EditUserRq): Promise<boolean> {
        const user = await User.findOne({ where: { token } })
        const existingUser = await User.findOne({ where: { phone_number } })

        if (existingUser) throw generateHttpError("user_phone_number_already_exists")
        if (!user) throw generateHttpError("user_not_found")

        if (fullname) user.fullname = fullname
        if (phone_number) user.phone_number = phone_number

        await user.save()

        return true
    }
}

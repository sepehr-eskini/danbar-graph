import { generateHttpError } from "@core/functions"
import { Arg, Mutation, Query, Resolver } from "type-graphql"

import { User } from "./user.entity"
import { CreateUserRq, EditUserRq, FetchUsersListRq, ToggleUserStatus } from "./user.rq"

@Resolver()
export class UserResolver {
    @Query(() => [User])
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
    async toggleUserStatus(@Arg("body") { token }: ToggleUserStatus): Promise<boolean> {
        const user = await User.findOne({ where: { token } })
        if (!user) return false

        user.is_active = !user.is_active
        await user.save()

        return true
    }

    @Mutation(() => Boolean)
    async createUser(
        @Arg("body")
        { fullname, phone_number }: CreateUserRq,
    ): Promise<boolean> {
        const user = await User.create({ fullname, phone_number }).save()

        return !!user
    }

    @Mutation(() => Boolean)
    async editUser(@Arg("body") body: EditUserRq): Promise<boolean> {
        const user = await User.findOne({ where: { token: body.token } })
        if (!user) throw generateHttpError("user_not_found")

        if (body.fullname) user.fullname = body.fullname
        if (body.phone_number) user.phone_number = body.phone_number

        await user.save()

        return true
    }
}

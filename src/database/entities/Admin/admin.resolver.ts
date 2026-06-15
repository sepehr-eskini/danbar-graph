import { generateHttpError, hashToken, JWT } from "@core/functions"
import { AuthMiddleware } from "@core/middlewares"
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql"

import { Admin } from "./admin.entity"
import { AdminLoginRq, CreateAdminRq } from "./admin.rq"

@Resolver()
export class AdminResolver {
    @Query(() => Admin)
    @UseMiddleware([AuthMiddleware])
    async currentAdmin(@Ctx("admin") admin: Admin): Promise<Admin> {
        return admin
    }

    @Mutation(() => Boolean)
    async createAdmin(
        @Arg("body")
        { username, fullname, phone_number, password }: CreateAdminRq,
    ): Promise<boolean> {
        const admin = await Admin.create({ username, fullname, phone_number, password }).save()

        return !!admin
    }

    @Mutation(() => String)
    async adminLogin(@Arg("body") { username, password }: AdminLoginRq): Promise<string> {
        const admin = await Admin.findOne({ where: { username } })

        if (!admin) throw generateHttpError("unauthorized")
        if (admin.password !== hashToken(password)) throw generateHttpError("unauthorized")

        return JWT.sign(admin.token)
    }
}

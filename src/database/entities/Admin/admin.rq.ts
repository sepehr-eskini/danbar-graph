import { Field, InputType } from "type-graphql"

import { E_AdminPermission } from "./admin.types"

@InputType()
export class CreateAdminRq {
    @Field()
    username: string

    @Field()
    fullname: string

    @Field()
    password: string

    @Field()
    phone_number: string

    @Field(() => [E_AdminPermission])
    permissions: E_AdminPermission[]
}

@InputType()
export class AdminLoginRq {
    @Field()
    username: string

    @Field()
    password: string
}

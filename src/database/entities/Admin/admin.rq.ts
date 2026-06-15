import { Field, InputType } from "type-graphql"

@InputType()
export class CreateAdminRq {
    @Field()
    username: string

    @Field()
    fullname: string

    @Field()
    password: string

    @Field()
    phone_number: number
}

@InputType()
export class AdminLoginRq {
    @Field()
    username: string

    @Field()
    password: string
}

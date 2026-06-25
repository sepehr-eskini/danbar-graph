import { Field, InputType } from "type-graphql"

import { E_RegisterStatus } from "./register.types"

@InputType()
export class SubmissionInput {
    @Field()
    date: string

    @Field()
    session_token: string
}

@InputType()
export class CreateRegisterRq {
    @Field()
    user_token: string

    @Field()
    class_token: string

    @Field()
    price_token: string

    @Field()
    payment_date: string

    @Field()
    payment_price: number

    @Field()
    discount_price: number

    @Field()
    calendar_image_url: string

    @Field(() => [SubmissionInput])
    submissions: SubmissionInput[]
}

@InputType()
export class EditRegisterRq {
    @Field()
    token: string

    @Field({ nullable: true })
    payment_date?: string

    @Field({ nullable: true })
    payment_price?: number

    @Field({ nullable: true })
    discount_price?: number

    @Field({ nullable: true })
    return_price?: number
}

@InputType()
export class FetchRegisterListRq {
    @Field({ nullable: true })
    user_token?: string

    @Field({ nullable: true })
    class_token?: string

    @Field({ nullable: true })
    price_token?: string

    @Field({ nullable: true })
    payment_date?: string

    @Field({ nullable: true })
    admin_token?: string

    @Field({ nullable: true })
    last_schedule_date?: string
}

@InputType()
export class SetRegisterRq {
    @Field()
    token: string

    @Field(() => E_RegisterStatus)
    status: E_RegisterStatus
}

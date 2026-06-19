// register.rq.ts
import { Field, InputType } from "type-graphql"

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
    calendar_image_url: string

    @Field(() => [SubmissionInput]) // Explicitly specify the type
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
}

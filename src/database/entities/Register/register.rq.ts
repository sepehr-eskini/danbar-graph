import { Field, InputType } from "type-graphql"

@InputType()
export class CreateRegisterRq {
    @Field()
    user_token: string

    @Field()
    class_token: string

    @Field()
    instructor_token: string

    @Field()
    payment_date: string

    @Field()
    payment_price: number

    @Field()
    class_price: number

    @Field()
    calendar_image_url: string
}

@InputType()
export class FetchRegisterListRq {
    @Field({ nullable: true })
    user_token?: string

    @Field({ nullable: true })
    class_token?: string

    @Field({ nullable: true })
    instructor_token?: string

    @Field({ nullable: true })
    payment_date?: string

    @Field({ nullable: true })
    payment_price?: number

    @Field({ nullable: true })
    class_price?: number
}

@InputType()
export class EditRegisterRq {
    @Field()
    token: string

    @Field({ nullable: true })
    user_token?: string

    @Field({ nullable: true })
    class_token?: string

    @Field({ nullable: true })
    instructor_token?: string

    @Field({ nullable: true })
    payment_date?: string

    @Field({ nullable: true })
    payment_price?: number

    @Field({ nullable: true })
    class_price?: number
}

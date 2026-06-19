import { Field, InputType } from "type-graphql"

@InputType()
export class CreatePriceRq {
    @Field()
    class_token: string

    @Field()
    sessions_count: number

    @Field()
    price: number

    @Field({ nullable: true })
    is_active?: boolean
}

@InputType()
export class EditPriceRq {
    @Field()
    token: string

    @Field({ nullable: true })
    class_token?: string

    @Field({ nullable: true })
    sessions_count?: number

    @Field({ nullable: true })
    price?: number

    @Field({ nullable: true })
    is_active?: boolean
}

@InputType()
export class TogglePriceStatus {
    @Field()
    token: string
}

@InputType()
export class FetchPriceListRq {
    @Field({ nullable: true })
    class_token?: string

    @Field({ nullable: true })
    sessions_count?: number

    @Field({ nullable: true })
    price?: number

    @Field({ nullable: true })
    is_active?: boolean
}

@InputType()
export class DeletePriceRq {
    @Field()
    token: string
}

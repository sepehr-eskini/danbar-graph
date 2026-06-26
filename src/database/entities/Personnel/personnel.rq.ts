import { Field, InputType } from "type-graphql"

@InputType()
export class CreatePersonnelRq {
    @Field()
    full_name: string

    @Field({ nullable: true })
    phone_number: string

    @Field({ nullable: true, defaultValue: 0 })
    income_percentage?: number

    @Field({ nullable: true, defaultValue: 0 })
    fixed_income_price?: number
}

@InputType()
export class TogglePersonnelStatus {
    @Field()
    token: string
}

@InputType()
export class FetchPersonnelListRq {
    @Field({ nullable: true })
    full_name?: string

    @Field({ nullable: true })
    phone_number?: string

    @Field({ nullable: true })
    is_active?: boolean
}

@InputType()
export class FetchActivePersonnelListRq {
    @Field({ nullable: true })
    full_name?: string
}

@InputType()
export class EditPersonnelRq {
    @Field()
    token: string

    @Field({ nullable: true })
    full_name?: string

    @Field({ nullable: true })
    phone_number?: string

    @Field({ nullable: true })
    income_percentage?: number

    @Field({ nullable: true })
    fixed_income_price?: number
}

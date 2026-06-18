import { Field, InputType } from "type-graphql"

import { E_Day } from "./session.types"

@InputType()
export class CreateSessionRq {
    @Field(() => E_Day)
    day: E_Day

    @Field()
    time_period_token: string
}

@InputType()
export class ToggleSessionStatus {
    @Field()
    token: string
}

@InputType()
export class FetchSessionListRq {
    @Field(() => E_Day, { nullable: true })
    day?: E_Day

    @Field({ nullable: true })
    time_period_token?: string

    @Field({ nullable: true })
    is_active?: boolean
}

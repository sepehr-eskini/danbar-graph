import { Field, InputType } from "type-graphql"

@InputType()
export class ToggleTimePeriodStatus {
    @Field()
    token: string
}

@InputType()
export class CreateTimePeriodRq {
    @Field()
    title: string

    @Field()
    from_time: string

    @Field()
    to_time: string
}

@InputType()
export class EditTimePeriodRq {
    @Field()
    token: string

    @Field({ nullable: true })
    title?: string

    @Field({ nullable: true })
    from_time?: string

    @Field({ nullable: true })
    to_time?: string
}

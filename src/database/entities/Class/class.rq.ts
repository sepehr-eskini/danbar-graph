import { Field, InputType } from "type-graphql"

import { E_ClassType } from "./class.types"

@InputType()
export class CreateClassRq {
    @Field()
    title: string

    @Field(() => [String])
    session_tokens: string[]

    @Field(() => E_ClassType)
    type: E_ClassType

    @Field()
    price: number
}

@InputType()
export class ToggleClassStatus {
    @Field()
    token: string
}

@InputType()
export class FetchClassListRq {
    @Field({ nullable: true })
    title?: string

    @Field(() => E_ClassType, { nullable: true })
    type?: E_ClassType

    @Field({ nullable: true })
    price?: number

    @Field({ nullable: true })
    session_token?: string
}

@InputType()
export class FetchActiveClassListRq {
    @Field({ nullable: true })
    title?: string

    @Field(() => E_ClassType, { nullable: true })
    type?: E_ClassType

    @Field({ nullable: true })
    price?: number

    @Field({ nullable: true })
    session_token?: string
}

@InputType()
export class EditClassRq {
    @Field()
    token: string

    @Field({ nullable: true })
    title?: string

    @Field(() => [String], { nullable: true })
    sessions?: string[]

    @Field(() => E_ClassType, { nullable: true })
    type?: E_ClassType

    @Field({ nullable: true })
    price?: number
}

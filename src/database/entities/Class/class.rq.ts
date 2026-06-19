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
    instructor_token: string

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
    instructor_token?: string
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
    instructor_token?: string
}

@InputType()
export class EditClassRq {
    @Field()
    token: string

    @Field({ nullable: true })
    title?: string

    @Field(() => [String], { nullable: true })
    session_tokens?: string[]

    @Field(() => E_ClassType, { nullable: true })
    type?: E_ClassType

    @Field({ nullable: true })
    instructor_token?: string

    @Field({ nullable: true })
    price?: number
}

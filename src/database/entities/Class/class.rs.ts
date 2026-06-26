import { Field, Int, ObjectType } from "type-graphql"

import { Session } from "../Session"
import { Class } from "./class.entity"

@ObjectType()
export class ClassUserScheduleSummary {
    @Field(() => Int)
    count: number

    @Field(() => [String])
    user_names: string[]
}

@ObjectType()
export class ClassSessionPopulation {
    @Field()
    session_token: string

    @Field(() => Session)
    session: Session

    @Field(() => Int)
    population_count: number

    @Field(() => ClassUserScheduleSummary)
    one_remaining: ClassUserScheduleSummary

    @Field(() => ClassUserScheduleSummary)
    two_remaining: ClassUserScheduleSummary

    @Field(() => ClassUserScheduleSummary)
    at_least_three_remaining: ClassUserScheduleSummary
}

@ObjectType()
export class ClassSessionPopulations {
    @Field()
    class_token: string

    @Field(() => Class)
    class: Class

    @Field(() => [ClassSessionPopulation])
    sessions: ClassSessionPopulation[]

    @Field(() => Int)
    total_population: number
}

@ObjectType()
export class FetchClassListRs {
    @Field(() => Class)
    class: Class

    @Field(() => [ClassSessionPopulation])
    sessions: ClassSessionPopulation[]
}

@ObjectType()
export class FetchClassByTokenRs {
    @Field(() => Class)
    class: Class

    @Field(() => [Session])
    sessions: Session[]
}

@ObjectType()
export class FetchActiveClassListRs {
    @Field(() => Class)
    class: Class

    @Field(() => [Session])
    sessions: Session[]
}

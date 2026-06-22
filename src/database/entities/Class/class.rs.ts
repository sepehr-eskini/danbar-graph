import { Field, Int, ObjectType } from "type-graphql"

import { Session } from "../Session"
import { Class } from "./class.entity"

@ObjectType()
export class ClassSessionPopulation {
    @Field()
    session_token: string

    @Field(() => Session)
    session: Session

    @Field(() => Int)
    population_count: number
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

    @Field(() => [Session])
    sessions: Session[]
}

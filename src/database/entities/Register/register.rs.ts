import { Field, Int, ObjectType } from "type-graphql"

import { Class } from "../Class/class.entity"
import { User } from "../User/user.entity"
import { Register } from "./register.entity"

@ObjectType()
export class UserWithUnsetScheduleInfo {
    @Field(() => User)
    user: User

    @Field(() => Int)
    unset_count: number

    @Field(() => Class, { nullable: true })
    last_unset_class: Class | null

    @Field({ nullable: true })
    last_unset_submission_date: string | null
}

@ObjectType()
export class ScheduleStatusCount {
    @Field(() => Int)
    unset: number

    @Field(() => Int)
    present: number

    @Field(() => Int)
    absent: number

    @Field(() => Int)
    cancel: number

    @Field(() => Int)
    offset: number
}

@ObjectType()
export class FetchRegistersRs {
    @Field(() => Register)
    register: Register

    @Field(() => ScheduleStatusCount)
    schedule_status: ScheduleStatusCount
}

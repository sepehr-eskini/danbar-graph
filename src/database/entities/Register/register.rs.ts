import { Field, Int, ObjectType } from "type-graphql"

import { Class } from "../Class/class.entity"
import { User } from "../User/user.entity"

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

import { Field, InputType } from "type-graphql"

import { E_ScheduleStatus } from "./schedule.types"

@InputType()
export class FetchScheduleListRq {
    @Field({ nullable: true })
    user_token?: string

    @Field({ nullable: true })
    class_token?: string

    @Field({ nullable: true })
    submission_date?: string

    @Field({ nullable: true })
    submission_session_token?: string

    @Field({ nullable: true })
    submission_instructor_token?: string

    @Field(() => E_ScheduleStatus, { nullable: true })
    status?: E_ScheduleStatus

    @Field({ nullable: true })
    payment_date?: string
}

@InputType()
export class FetchSchedulesByDateRq {
    @Field()
    date: string
}

@InputType()
export class SetScheduleRq {
    @Field()
    token: string

    @Field(() => E_ScheduleStatus)
    status: E_ScheduleStatus
}

@InputType()
export class EditScheduleRq {
    @Field()
    token: string

    @Field({ nullable: true })
    presence_date?: string

    @Field({ nullable: true })
    presence_session_token?: string

    @Field({ nullable: true })
    presence_instructor_token?: string
}

@InputType()
export class EditScheduleSubmissionRq {
    @Field()
    token: string

    @Field()
    submission_date: string

    @Field()
    submission_session_token: string
}

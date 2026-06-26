import { Field, ObjectType } from "type-graphql"

import { Schedule } from "./schedule.entity"

@ObjectType()
export class FetchTomorrowSchedulesRs {
    @Field(() => Schedule)
    schedule: Schedule

    @Field(() => Boolean)
    is_last_session: boolean
}

@ObjectType()
export class FetchTodaySchedulesRs {
    @Field(() => Schedule)
    schedule: Schedule

    @Field(() => Boolean)
    is_last_session: boolean
}

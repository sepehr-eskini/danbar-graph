import { Field, InputType } from "type-graphql"

@InputType()
export class ToggleUserStatus {
    @Field()
    token: string
}

@InputType()
export class CreateUserRq {
    @Field()
    fullname: string

    @Field()
    phone_number: number
}

@InputType()
export class FetchUsersListRq {
    @Field({ nullable: true })
    fullname?: string

    @Field({ nullable: true })
    phone_number?: number
}

@InputType()
export class EditUserRq {
    @Field()
    token: string

    @Field({ nullable: true })
    fullname?: string

    @Field({ nullable: true })
    phone_number?: number
}

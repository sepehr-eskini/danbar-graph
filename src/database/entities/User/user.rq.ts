import { Field, InputType } from "type-graphql"

@InputType()
export class ToggleUserStatus {
    @Field()
    token: string
}

@InputType()
export class CreateUserRq {
    @Field()
    full_name: string

    @Field({ nullable: true })
    phone_number: string
}

@InputType()
export class FetchUsersListRq {
    @Field({ nullable: true })
    full_name?: string

    @Field({ nullable: true })
    phone_number?: string

    @Field({ nullable: true })
    is_active?: boolean
}

@InputType()
export class FetchActiveUsersListRq {
    @Field({ nullable: true })
    full_name?: string
}

@InputType()
export class EditUserRq {
    @Field()
    token: string

    @Field({ nullable: true })
    full_name?: string

    @Field({ nullable: true })
    phone_number?: string
}

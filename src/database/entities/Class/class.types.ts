import { registerEnumType } from "type-graphql"

export enum E_ClassType {
    GROUP = "GROUP",
    SEMI_GROUP = "SEMI_GROUP",
    SEMI_PRIVATE = "SEMI_PRIVATE",
    PRIVATE = "PRIVATE",
}

registerEnumType(E_ClassType, { name: "E_ClassType" })

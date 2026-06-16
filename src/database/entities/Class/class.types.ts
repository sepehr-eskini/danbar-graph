import { registerEnumType } from "type-graphql"

export enum E_ClassType {
    GROUP = "GROUP",
    SEMI_GROUP = "SEMI_GROUP",
    SEMI_PRIVATE = "SEMI_PRIVATE",
    PRIVATE = "PRIVATE",
}

export enum E_ClassLevel {
    BEGINNER = "BEGINNER",
    INTERMEDIATE = "INTERMEDIATE",
    ADVANCED = "ADVANCED",
}

registerEnumType(E_ClassType, { name: "E_ClassType" })
registerEnumType(E_ClassLevel, { name: "E_ClassLevel" })

import { registerEnumType } from "type-graphql"

export enum E_PersonnelRole {
    CEO = "CEO",
    INSTRUCTOR = "INSTRUCTOR",
    MANAGER = "MANAGER",
}

registerEnumType(E_PersonnelRole, { name: "E_PersonnelRole" })

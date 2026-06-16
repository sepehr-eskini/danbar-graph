import { registerEnumType } from "type-graphql"

export enum E_AdminPermission {
    READ = "READ",
    CREATE = "CREATE",
    UPDATE = "UPDATE",
}

registerEnumType(E_AdminPermission, { name: "E_AdminPermission" })

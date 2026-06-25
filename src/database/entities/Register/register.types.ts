import { registerEnumType } from "type-graphql"

export enum E_RegisterStatus {
    ACTIVE = "ACTIVE",
    CHANGE = "CHANGE",
    FINISH = "FINISH",
    CANCEL = "CANCEL",
}

registerEnumType(E_RegisterStatus, { name: "E_RegisterStatus" })

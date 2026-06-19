import { registerEnumType } from "type-graphql"

export enum E_ScheduleStatus {
    UNSET = "UNSET",
    PRESENT = "PRESENT",
    ABSENT = "ABSENT",
    CANCEL = "CANCEL",
}

registerEnumType(E_ScheduleStatus, { name: "E_ScheduleStatus" })

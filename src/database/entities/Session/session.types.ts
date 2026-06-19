import { registerEnumType } from "type-graphql"

export enum E_Day {
    SAT = "SAT",
    SUN = "SUN",
    MON = "MON",
    TUE = "TUE",
    WED = "WED",
    THU = "THU",
    FRI = "FRI",
}

registerEnumType(E_Day, { name: "E_Day" })

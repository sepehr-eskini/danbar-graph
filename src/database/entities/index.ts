import { Admin } from "./Admin"
import { Personnel } from "./Personnel"
import { TimePeriod } from "./TimePeriod"
import { User } from "./User"

export * from "./Admin"
export * from "./Personnel"
export * from "./TimePeriod"
export * from "./User"

export const DatabaseEntities = [User, Admin, Personnel, TimePeriod]

import { Admin } from "./Admin"
import { Class } from "./Class"
import { Personnel } from "./Personnel"
import { Price } from "./Price"
import { Register } from "./Register"
import { Session } from "./Session"
import { TimePeriod } from "./TimePeriod"
import { User } from "./User"

export * from "./Admin"
export * from "./Class"
export * from "./Personnel"
export * from "./Price"
export * from "./Register"
export * from "./Session"
export * from "./TimePeriod"
export * from "./User"

export const DatabaseEntities = [User, Admin, Personnel, TimePeriod, Class, Register, Session, Price]

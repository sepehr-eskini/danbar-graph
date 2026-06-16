import { initTimePeriod } from "./time-period.init"

export const databaseInitialization = async () => {
    await initTimePeriod()
}

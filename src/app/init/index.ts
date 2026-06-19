import { initAdmin } from "./admin.init"
import { initPersonnel } from "./personnel.init"
import { initSession } from "./session.init"
import { initTimePeriod } from "./time-period.init"
import { initUser } from "./user.init"

export const databaseInitialization = async () => {
    await initAdmin()
    await initTimePeriod()
    await initSession()
    await initUser()
    await initPersonnel()
}

import type { CreateSessionRq } from "@database/entities"
import { E_Day, Session, TimePeriod } from "@database/entities"

const DEFAULT_SESSIONS: CreateSessionRq[] = [
    { day: E_Day.SAT, time_period_token: "" },
    { day: E_Day.SAT, time_period_token: "" },
    { day: E_Day.SUN, time_period_token: "" },
    { day: E_Day.SUN, time_period_token: "" },
    { day: E_Day.MON, time_period_token: "" },
    { day: E_Day.MON, time_period_token: "" },
    { day: E_Day.TUE, time_period_token: "" },
    { day: E_Day.TUE, time_period_token: "" },
    { day: E_Day.WED, time_period_token: "" },
    { day: E_Day.WED, time_period_token: "" },
]

export const initSession = async () => {
    const sessionCount = await Session.count({})

    if (sessionCount === 0) {
        const timePeriods = await TimePeriod.find()

        const sessions = DEFAULT_SESSIONS.map((session, index) => ({
            day: session.day,
            time_period_token: timePeriods[index % 2 === 0 ? 10 : 12].token,
            admin_token: "system_initialization",
        }))

        await Session.insert(sessions)
    }
}

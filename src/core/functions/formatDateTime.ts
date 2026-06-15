import { SYSTEM_TZ } from "@core/utilities"
import { toZonedTime } from "date-fns-tz"

export const formatDateTime = (date: Date) => {
    const d = toZonedTime(date, SYSTEM_TZ)

    return d.toLocaleString("fa-IR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })
}

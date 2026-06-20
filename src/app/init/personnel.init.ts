import type { CreatePersonnelRq } from "@database/entities"
import { Personnel } from "@database/entities"

const DEFAULT_PERSONNEL: CreatePersonnelRq[] = [
    { full_name: "الهام", phone_number: "09371001021", income_percentage: 40 },
    { full_name: "الهه", phone_number: "09371001022", income_percentage: 40 },
    { full_name: "نگین", phone_number: "09371001023", income_percentage: 50 },
    { full_name: "آیدا", phone_number: "09371001024", income_percentage: 40 },
    { full_name: "نیلو", phone_number: "09371001025", income_percentage: 0 },
]

export const initPersonnel = async () => {
    const personnelCount = await Personnel.count({})

    if (personnelCount === 0) {
        const personnel = DEFAULT_PERSONNEL.map(person => ({
            ...person,
            admin_token: "system_initialization",
        }))

        await Personnel.insert(personnel)
    }
}

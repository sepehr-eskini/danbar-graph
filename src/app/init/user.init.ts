import type { CreateUserRq } from "@database/entities"
import { User } from "@database/entities"

const DEFAULT_USERS: CreateUserRq[] = [
    { full_name: "زهرا رضایی", phone_number: "09361001001" },
    { full_name: "مریم کریمی", phone_number: "09361001002" },
    { full_name: "فاطمه احمدی", phone_number: "09361001003" },
    { full_name: "نرگس سلطانی", phone_number: "09361001004" },
    { full_name: "سارا قاسمی", phone_number: "09361001005" },
    { full_name: "مهسا حسینی", phone_number: "09361001006" },
    { full_name: "الناز علی مردانی", phone_number: "09361001007" },
    { full_name: "سحر مریدی", phone_number: "09361001008" },
    { full_name: "ندا تقی پور", phone_number: "09361001009" },
    { full_name: "رها رحیمی", phone_number: "09361001010" },
    { full_name: "هانیه امینی", phone_number: "09361001011" },
    { full_name: "مریم رضایی", phone_number: "09361001012" },
    { full_name: "سارا احمدی", phone_number: "09361001013" },
    { full_name: "فاطمه کریمی", phone_number: "09361001014" },
    { full_name: "نرگس محمدی", phone_number: "09361001015" },
    { full_name: "زهرا قاسمی", phone_number: "09361001016" },
    { full_name: "مهسا حسنی", phone_number: "09361001017" },
    { full_name: "الناز علیپور", phone_number: "09361001018" },
    { full_name: "سحر مرادی", phone_number: "09361001019" },
    { full_name: "ندا تقوی", phone_number: "09361001020" },
]

export const initUser = async () => {
    const userCount = await User.count({})

    if (userCount === 0) {
        const users = DEFAULT_USERS.map(user => ({
            ...user,
            admin_token: "system_initialization",
        }))

        await User.insert(users)
    }
}

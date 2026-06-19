import { hashToken } from "@core/functions"
import type { CreateAdminRq } from "@database/entities"
import { Admin, E_AdminPermission } from "@database/entities"

const DEFAULT_ADMINS: CreateAdminRq[] = [
    {
        full_name: "مرضیه شاکری",
        username: "marzigoli",
        phone_number: "09361001000",
        password: "abcd1234",
        permissions: [E_AdminPermission.READ, E_AdminPermission.CREATE, E_AdminPermission.UPDATE],
    },
]

export const initAdmin = async () => {
    const adminCount = await Admin.count({})

    if (adminCount === 0) {
        const admins = DEFAULT_ADMINS.map(admin => ({
            ...admin,
            password: hashToken(admin.password),
        }))

        await Admin.insert(admins)
    }
}

import { generateHttpError, JWT } from "@core/functions"
import { Admin, AdminRelations } from "@database/entities"

export const GraphqlRouter = async ({ req }) => {
    try {
        const { authorization } = req.headers
        if (!authorization) throw generateHttpError("unauthorized")

        const token = JWT.verify(authorization)

        const admin = await Admin.findOneOrFail({
            relations: AdminRelations,
            where: {
                token,
            },
        })

        if (!admin) throw generateHttpError("unauthorized")

        return {
            admin,
        }
    } catch (error) {
        return {
            user: null,
        }
    }
}

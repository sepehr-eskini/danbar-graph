import { generateHttpError, JWT } from "@core/functions"
import { User, UserRelations } from "@database/entities"

export const GraphqlRouter = async ({ req }) => {
    try {
        const { authorization } = req.headers
        if (!authorization) throw generateHttpError("unauthorized")

        const token = JWT.verify(authorization)

        const user = await User.findOneOrFail({
            relations: UserRelations,
            where: {
                token,
            },
        })

        if (!user) throw generateHttpError("unauthorized")

        return {
            user,
        }
    } catch (error) {
        return {
            user: null,
        }
    }
}

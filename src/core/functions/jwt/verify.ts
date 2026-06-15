import { JWT_OPTIONS, JWT_SECRET_KEY } from "@core/utilities"
import jwt from "jsonwebtoken"

export const verifyJWT = (input: string, secret = JWT_SECRET_KEY, options = JWT_OPTIONS): string | null => {
    try {
        const verification = jwt.verify(input, secret, options)
        // eslint-disable-next-line prefer-destructuring, @typescript-eslint/dot-notation
        const token = verification["token"]
        if (token) return token
        return null
    } catch (error) {
        return error.message
    }
}

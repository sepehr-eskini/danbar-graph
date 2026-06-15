import { JWT_OPTIONS, JWT_SECRET_KEY } from "@core/utilities"
import jwt from "jsonwebtoken"

export const signJWT = (input: string, secret = JWT_SECRET_KEY, options = JWT_OPTIONS) =>
    jwt.sign({ token: input }, secret, options)

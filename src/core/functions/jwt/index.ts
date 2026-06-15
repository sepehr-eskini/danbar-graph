import { signJWT } from "./sign"
import { verifyJWT } from "./verify"

export const JWT = {
    sign: signJWT,
    verify: verifyJWT,
}

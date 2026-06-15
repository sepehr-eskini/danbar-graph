import { PASSWORD_ENCRYPTION_SECRET_KEY } from "@core/utilities"
import crypto from "crypto"

export const hashToken = (token: string) =>
    crypto.createHmac("sha256", PASSWORD_ENCRYPTION_SECRET_KEY).update(token).digest("hex")

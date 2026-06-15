/* eslint-disable no-console */
import * as dotenv from "dotenv"
import type jwt from "jsonwebtoken"

dotenv.config()

export const MIN_PASSWORD_LENGTH = 8
export const JWT_OPTIONS: jwt.SignOptions = { algorithm: "HS256", expiresIn: "100y" }

export const {
    APP_PORT,
    PASSWORD_ENCRYPTION_SECRET_KEY,
    JWT_SECRET_KEY,
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    DB_PORT,
} = process.env

export const SYSTEM_TZ = "Asia/Tehran"
export const DATE_FORMAT = "yyyy-MM-dd"

import { ErrorMessages } from "@core/functions"
import express from "express"

export const ErrorRouter = express.Router()

ErrorRouter.get("/", (req, res) => {
    return res.status(200).json(ErrorMessages)
})

import createHttpError from "http-errors"

import type { T_Error } from "./error.types"

export const generateHttpError = (error: T_Error) => createHttpError(error)

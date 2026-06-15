import { unwrapResolverError } from "@apollo/server/errors"
import { GraphQLError, type GraphQLFormattedError } from "graphql"
import createHttpError from "http-errors"
import { ArgumentValidationError } from "type-graphql"
import { TypeORMError } from "typeorm"

import { generateHttpError } from "./generateHttpError"

export const formatError = (formattedError: GraphQLFormattedError, error: unknown) => {
    // Unwrapping the original error
    const originalError = unwrapResolverError(error)

    // Check if the Error is an instance of Argument Validation Error or not
    // This also includes the class-validator error messages
    if (originalError instanceof ArgumentValidationError) {
        const errorObject = originalError.validationErrors[0]?.constraints

        // This part is for regular class validator checks (non-nested-object errors go here. check the next part)
        if (errorObject)
            return createHttpError({
                message: Object.values(errorObject)[0],
            })

        // This part is for nested objects class validator checks
        const error = {
            message: "Argument Validation Error",
            property: originalError.validationErrors[0].property,
        }
        return createHttpError(error)
    }

    if (originalError instanceof createHttpError.HttpError) return createHttpError(formattedError.message)
    if (originalError instanceof GraphQLError)
        if (formattedError.extensions.code === "BAD_USER_INPUT") return generateHttpError("bad_request")
    if (originalError instanceof TypeORMError) return generateHttpError("internal_server_error")

    // And finally, just to make sure that we have covered all the cases:
    return generateHttpError("unknown")
}

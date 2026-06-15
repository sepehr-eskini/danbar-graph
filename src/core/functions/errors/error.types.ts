export type T_Error =
    // Common
    | "unauthorized"
    | "unknown"
    | "internal_server_error"
    | "bad_request"

    // User
    | "user_not_found"

export type T_ErrorMessage = {
    [key in T_Error]: string
}

export type T_ErrorMessages = {
    fa: T_ErrorMessage
}

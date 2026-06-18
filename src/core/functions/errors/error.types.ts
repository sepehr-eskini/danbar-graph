export type T_Error =
    // Common
    | "unauthorized"
    | "unknown"
    | "internal_server_error"
    | "bad_request"

    // Admin
    | "admin_already_exists"

    // User
    | "user_not_found"
    | "user_phone_number_already_exists"
    | "user_full_name_already_exists"

    // Personnel
    | "personnel_not_found"
    | "personnel_phone_number_already_exists"
    | "personnel_full_name_already_exists"

    // TimePeriod
    | "time_period_not_found"
    | "invalid_time_format"
    | "time_period_title_already_exists"
    | "time_period_pair_already_exists"

    // Session
    | "session_not_found"
    | "session_day_time_period_already_exists"
    | "one_or_more_sessions_not_found"

    // Class
    | "class_not_found"
    | "class_title_type_already_exists"

export type T_ErrorMessage = {
    [key in T_Error]: string
}

export type T_ErrorMessages = {
    fa: T_ErrorMessage
}

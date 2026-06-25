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
    | "instructor_not_found"

    // TimePeriod
    | "time_period_not_found"
    | "invalid_time_format"
    | "time_period_title_already_exists"
    | "time_period_pair_already_exists"

    // Session
    | "session_not_found"
    | "session_day_time_period_already_exists"
    | "invalid_session_tokens"

    // Class
    | "class_not_found"
    | "class_title_type_instructor_already_exists"

    // Price
    | "price_not_found"
    | "price_sessions_count_price_already_exists"

    // Register
    | "register_not_found"

    // Schedule
    | "schedule_not_found"
    | "invalid_session_for_class"

export type T_ErrorMessage = {
    [key in T_Error]: string
}

export type T_ErrorMessages = {
    fa: T_ErrorMessage
}

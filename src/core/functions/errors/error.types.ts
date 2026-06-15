export type T_Error =
    // Common
    | "unauthorized"
    | "unknown"
    | "internal_server_error"
    | "bad_request"

    // User
    | "duplicated_username"
    | "user_not_found"
    | "user_expired"
    | "user_not_active"

    // Role
    | "role_not_found"
    | "supervisor_not_found"
    | "duplicated_role_name"
    | "system_user_not_found"

    // Fund
    | "system_pos_not_found"
    | "manual_pos_not_found"
    | "fund_not_found"
    | "active_session_not_found"

    // Off day
    | "duplicated_selected_date"
    | "selected_date_not_found"

    // Pos
    | "pos_not_found"

    // Client
    | "client_not_found"
    | "camera_not_found"
    | "driver_cam_not_found"
    | "plate_cam_not_found"
    | "controller_not_found"
    | "reader_not_found"
    | "relay_not_found"
    | "duplicated_client"

    // Inactive car
    | "selected_car_not_found"

    // Blocked car
    | "car_already_exists"

    // Card
    | "card_not_found"
    | "card_duplicated_csn"
    | "card_duplicated_number"
    | "card_not_active"
    | "no_associated_active_for_card"
    | "card_in_use"

    // Customer
    | "duplicated_customer_mobile"
    | "customer_not_found"

    // Group
    | "group_not_found"
    | "tax_input_limit"
    | "invalid_group_type"
    | "credit_time_type_not_allowed"

    // Session
    | "duplicated_open_session"

    // Discount
    | "invalid_discount_percentage"
    | "invalid_discount_amount"
    | "invalid_date_range"
    | "discount_not_found"
    | "code_is_used"
    | "code_not_found"
    | "discount_is_not_active"
    | "count_more_than_max"

    // Traffic
    | "traffic_not_found"
    | "card_not_linked_to_customer"
    | "customer_not_linked_card_customer"
    | "customer_not_active"
    | "default_cash_group_not_defined"

    // Customer log check errors
    | "customer_log_access_granted"
    | "customer_log_exit_granted"
    | "customer_log_expired"
    | "customer_log_apb_violation"
    | "customer_log_access_not_allowed_today"
    | "customer_log_daily_limit_reached"
    | "customer_log_monthly_limit_reached"

    // Identifier
    | "identifier_not_found"
    | "duplicated_serial"
    | "duplicated_number"
    | "identifier_not_found"

    // Financial reports
    | "date_range_more_than_50"
    | "duration_more_than_50"
    | "backup_not_found"
    | "device_not_found"
    | "invalid_license"
    | "schedule_not_found"
    | "access_control_not_found"
    | "identifier_already_assigned_to_customer"
    | "identifier_not_available"
    | "plate_already_exists_for_customer"

export type T_ErrorMessage = {
    [key in T_Error]: string
}

export type T_ErrorMessages = {
    fa: T_ErrorMessage
}

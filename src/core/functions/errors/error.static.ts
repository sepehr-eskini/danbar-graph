import type { T_ErrorMessages } from "./error.types"

export const ErrorMessages: T_ErrorMessages = {
    fa: {
        // Common
        unauthorized: "دسترسی غیر مجاز",
        unknown: "خطای نامشخص",
        bad_request: "مشکل در ورودی داده‌ها",
        internal_server_error: "عدم دریافت پاسخ",

        // User
        user_not_found: "کاربر در سیستم وجود ندارد",
        user_phone_number_already_exists: "شماره تلفن کاربر وارد شده از قبل در سیستم وجود دارد",

        // Admin
        admin_phone_number_already_exists: "شماره تلفن ادمین وارد شده از قبل در سیستم وجود دارد",
    },
}

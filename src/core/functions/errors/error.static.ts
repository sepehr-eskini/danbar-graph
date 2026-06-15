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
    },
}

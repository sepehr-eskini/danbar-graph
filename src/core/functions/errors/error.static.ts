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
        user_phone_number_already_exists: "شماره تماس کاربر وارد شده از قبل در سیستم وجود دارد",
        user_full_name_already_exists: "نام کاربر وارد شده از قبل در سیستم وجود دارد",

        // Admin
        admin_already_exists: "ادمین با مشخصات وارد شده از قبل در سیستم وجود دارد",

        // Personnel
        personnel_not_found: "مربی در سیستم وجود ندارد",
        personnel_phone_number_already_exists: "شماره تماس مربی وارد شده از قبل در سیستم وجود دارد",
        personnel_full_name_already_exists: "نام مربی وارد شده از قبل در سیستم وجود دارد",
        instructor_not_found: "مربی در سیستم وجود ندارد",

        // TimePeriod
        time_period_not_found: "بازه زمانی در سیستم وجود ندارد",
        invalid_time_format: "فرمت وارد شده معتبر نیست",
        time_period_title_already_exists: "عنوان بازه زمانی وارد شده از قبل در سیستم وجود دارد",
        time_period_pair_already_exists: "بازه زمانی با زمان شروع و پایان وارد شده از قبل در سیستم وجود دارد",

        // Session
        session_not_found: "سانس در سیستم وجود ندارد",
        session_day_time_period_already_exists: "سانسی با روز و بازه زمانی وارد شده از قبل در سیستم وجود دارد",
        invalid_session_tokens: "توکن‌های وارد شده برای سانس نامعتبر هستند",

        // Class
        class_not_found: "کلاس در سیستم وجود ندارد",
        class_title_type_instructor_already_exists: "کلاسی با عنوان، نوع و مربی وارد شده از قبل در سیستم وجود دارد",

        // Price
        price_not_found: "قیمت در سیستم وجود ندارد",
        price_sessions_count_price_already_exists: "کلاسی با تعداد سانس و قیمت وارد شده از قبل در سیستم وجود دارد",

        // Register
        register_not_found: "ثبت نام در سیستم وجود ندارد",

        // Schedule
        schedule_not_found: "برنامه در سیستم وجود ندارد",
        invalid_session_for_class: "سانس انتخابی برای کلاس وجود ندارد",
        schedule_already_exists: "برنامه با تاریخ و سانس مورد نظر از قبل تعریف شده است",
    },
}

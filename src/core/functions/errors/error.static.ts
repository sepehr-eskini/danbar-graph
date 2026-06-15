import type { T_ErrorMessages } from "./error.types"

export const ErrorMessages: T_ErrorMessages = {
    fa: {
        // Common
        unauthorized: "دسترسی غیر مجاز",
        unknown: "خطای نامشخص",
        bad_request: "مشکل در ورودی داده‌ها",
        internal_server_error: "عدم دریافت پاسخ",

        // User
        duplicated_username: "نام‌کاربری در سیستم وجود دارد",
        user_not_found: "کاربر در سیستم وجود ندارد",
        user_expired: "کاربر مورد نظر منقضی شده است",
        user_not_active: "کاربر مورد نظر فعال نیست",

        // Role
        role_not_found: "نقش مورد نظر در سیستم وجود ندارد",
        duplicated_role_name: "نام نقش تکراری است",
        system_user_not_found: "کاربر سیستم یافت نشد",

        // Fund
        system_pos_not_found: "کارت‌خوان سیستمی یافت نشد",
        manual_pos_not_found: "کارت‌‌خوان دستی یافت نشد",
        supervisor_not_found: "سر‌پرست یافت نشد",
        fund_not_found: "صندوق مورد نظر یافت نشد",
        active_session_not_found: "نشست فعالی برای کاربر وجود ندارد",

        // Off day
        duplicated_selected_date: "تاریخ انتخاب شده تکراری است",
        selected_date_not_found: "تاریخ انتخابی یافت نشد",

        // POS
        pos_not_found: "کارت‌‌خوان یافت نشد",

        // Client
        client_not_found: "کلاینت در سیستم وجود ندارد",
        camera_not_found: "دوربین یافت نشد",
        driver_cam_not_found: "دوربین راننده یافت نشد",
        plate_cam_not_found: "دوربین پلاک یافت نشد",
        relay_not_found: "برد رله یافت نشد",
        controller_not_found: "کنترلر یافت نشد",
        reader_not_found: "ریدر یافت نشد",
        duplicated_client: "آیپی کلاینت تکراری است",

        // Inactive car
        selected_car_not_found: "خودرو مورد نظر یافت نشد",

        // Blocked car
        car_already_exists: "خودروي مورد نظر در سیستم وجود دارد",

        // Card
        card_not_found: "کارت مورد نظر یافت نشد",
        card_duplicated_csn: "کد CSN در سیستم وجود دارد",
        card_duplicated_number: "شماره کارت در سیستم وجود دارد",
        card_not_active: "کارت مورد نظر فعال نیست",
        no_associated_active_for_card: "تردد فعالی برای این کارت یافت نشد",
        card_in_use: "کارت در خروجی ثبت نشده است",

        // Customer
        duplicated_customer_mobile: "مشتری با شماره موبایل وارد شده در سیستم وجود دارد",
        customer_not_found: "مراجع یافت نشد",

        // Group
        group_not_found: "گروه مراجعین یافت نشد",
        tax_input_limit: "مالیات باید بین ۰ و ۱۰۰ باشد",
        invalid_group_type: "نوع تعریف نشده",
        credit_time_type_not_allowed: "نوع اعتباری زمانی مجاز نیست",

        // Sessions
        duplicated_open_session: "نشست تکراری",

        // Discounts
        invalid_discount_percentage: "درصد تخفیف نامعتبر است",
        invalid_discount_amount: "مبلغ تخفیف نامعتبر است",
        invalid_date_range: "بازه انتخابی نامعتبر است",
        discount_not_found: "تخفیف یافت نشد",
        code_is_used: "کد تخفیف قبلا استفاده شده است",
        code_not_found: "کد تخفیف یافت نشد",
        discount_is_not_active: "تخفیف فعال نیست",
        count_more_than_max: "تعداد تخفیف بیش از حد مجاز است",

        // Traffic
        traffic_not_found: "تردد یافت نشد",
        card_not_linked_to_customer: "مراجعی برای کارت مورد نظر یافت نشد",
        customer_not_linked_card_customer: "کارتی برای مراجع یافت نشد",
        customer_not_active: "مراجع غیرفعال است",
        default_cash_group_not_defined: "گروه نقدی پیش‌فرض مشخص نشده است",

        // Customer log check errors
        customer_log_access_granted: "ورود مجاز",
        customer_log_exit_granted: "خروج مجاز",
        customer_log_expired: "اتمام اعتبار",
        customer_log_apb_violation: "عدم رعایت توالی ورود و خروج",
        customer_log_access_not_allowed_today: "تردد در روز غیر مجاز",
        customer_log_daily_limit_reached: "تردد بیش از سقف مجاز روزانه",
        customer_log_monthly_limit_reached: "تردد بیش از سقف مجاز ماهانه",

        // Financial report
        date_range_more_than_50: "بازه انتخاب شده باید کمتر از ۵۰ روز باشد",
        duration_more_than_50: "تعداد روز انتخاب شده باید کمتر از ۵۰ باشد",
        backup_not_found: "فایل پشتیبان مورد نظر یافت نشد",
        device_not_found: "دستگاه یافت نشد",

        identifier_not_found: "شناسه مورد نظر یافت نشد",
        duplicated_serial: "سریال شناسه تکراری است",
        duplicated_number: "شماره شناسه تکراری است",

        invalid_license: "لایسنس نامعتبر",
        schedule_not_found: "برنامه زمان‌بندی یافت نشد",
        access_control_not_found: "کنترل دسترسی یافت نشد",
        identifier_already_assigned_to_customer: "شناسه قبلا به مراجع اختصاص داده شده است",
        identifier_not_available: "شناسه در دسترس نیست",
        plate_already_exists_for_customer: "شماره پلاک قبلا برای مراجع ثبت شده است",
    },
}

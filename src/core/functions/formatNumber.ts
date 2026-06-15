export const formatNumber = (num: number, lang?: string): string => {
    if (lang) return new Intl.NumberFormat(lang).format(num)
    return new Intl.NumberFormat("fa-IR").format(num)
}

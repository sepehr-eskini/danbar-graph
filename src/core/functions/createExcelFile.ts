import * as XLSX from "xlsx"

export const createExcelFile = (worksheetData: string[][]): string => {
    // Create workbook
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Discount Codes")

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
    })

    const base64Data = excelBuffer.toString("base64")

    return `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`
}

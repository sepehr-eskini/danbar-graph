/* eslint-disable @typescript-eslint/no-explicit-any */
// excel-export.util.ts
import type { SelectQueryBuilder } from "typeorm"

import { createExcelFile } from "./createExcelFile"

export const exportQueryToExcel = async (
    queryBuilder: SelectQueryBuilder<any>,
    headers: string[],
    mapper: (item: any) => any[],
): Promise<string> => {
    // Remove pagination but limit to reasonable number for Excel
    const items = await queryBuilder.skip(0).take(10000).getMany()

    // Map to Excel data
    const worksheetData = [headers, ...items.map(item => mapper(item))]

    return createExcelFile(worksheetData)
}

export const exportRawQueryToExcel = async (
    queryBuilder: SelectQueryBuilder<any>,
    headers: string[],
    mapper: (item: any) => any[],
): Promise<string> => {
    // For queries that use getRawMany() instead of getMany()
    const items = await queryBuilder.skip(0).take(10000).getRawMany()

    const worksheetData = [headers, ...items.map(item => mapper(item))]

    return createExcelFile(worksheetData)
}

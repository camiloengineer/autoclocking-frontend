import type { HolidayItem, HolidaysResponse } from '../domain/holiday.types'

const HOLIDAYS_DEFAULT_API_URL = 'https://api.boostr.cl/holidays.json'

function getHolidaysApiUrl() {
    return import.meta.env.VITE_HOLIDAYS_API_URL || HOLIDAYS_DEFAULT_API_URL
}

function normalizeHoliday(item: Partial<HolidayItem>): HolidayItem {
    return {
        date: String(item.date ?? ''),
        title: String(item.title ?? ''),
        type: String(item.type ?? ''),
        inalienable: Boolean(item.inalienable),
        extra: String(item.extra ?? '')
    }
}

export async function fetchHolidays(): Promise<HolidayItem[]> {
    const response = await fetch(getHolidaysApiUrl(), {
        headers: {
            Accept: 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error(`Endpoint unavailable (${response.status})`)
    }

    const payload = (await response.json()) as Partial<HolidaysResponse>

    if (payload.status !== 'success' || !Array.isArray(payload.data)) {
        throw new Error('Invalid API response')
    }

    return payload.data.map(normalizeHoliday)
}

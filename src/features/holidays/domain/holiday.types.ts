export type HolidayItem = {
    date: string
    title: string
    type: string
    inalienable: boolean
    extra: string
}

export type HolidaysResponse = {
    status: string
    data: HolidayItem[]
}

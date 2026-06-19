import { createMemo } from 'solid-js'
import { createQuery } from '@tanstack/solid-query'
import { todayISO } from '../domain/holiday.formatters'
import { fetchHolidays } from '../infra/holidays.api'
import { HOLIDAYS_QUERY_KEY } from './holidays.constants'

export function useHolidaysPage() {
    const holidaysQuery = createQuery(() => ({
        queryKey: HOLIDAYS_QUERY_KEY,
        queryFn: () => fetchHolidays()
    }))

    const upcomingHolidays = createMemo(() => {
        const today = todayISO()
        return (holidaysQuery.data ?? []).filter((holiday) => holiday.date >= today).sort((left, right) => left.date.localeCompare(right.date))
    })

    const refreshHolidays = async () => {
        await holidaysQuery.refetch()
    }

    return {
        upcomingHolidays,
        isLoading: () => holidaysQuery.isLoading,
        isFetching: () => holidaysQuery.isFetching,
        isError: () => holidaysQuery.isError,
        refreshHolidays
    }
}

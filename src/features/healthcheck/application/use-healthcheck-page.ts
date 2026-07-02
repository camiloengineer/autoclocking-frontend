import { createQuery } from '@tanstack/solid-query'
import { fetchHolidays } from '../../holidays/infra/holidays.api'
import { MARCAJES_HEALTHCHECK_LIMIT } from '../../marcajes/application/marcajes.constants'
import { fetchMarcajes } from '../../marcajes/infra/marcajes.api'
import { fetchRuts } from '../../ruts/infra/ruts.api'
import { getRutKey } from '../../ruts/domain/rut.formatters'
import { HEALTHCHECK_QUERY_KEY } from './healthcheck.constants'
import { buildHealthcheckDays } from '../domain/healthcheck.utils'

export function useHealthcheckPage() {
    const healthcheckQuery = createQuery(() => ({
        queryKey: HEALTHCHECK_QUERY_KEY,
        queryFn: async () => {
            const [marcajes, holidays, ruts] = await Promise.all([fetchMarcajes(MARCAJES_HEALTHCHECK_LIMIT), fetchHolidays(), fetchRuts()])
            const activeRuts = ruts.items.filter((rut) => rut.active)
            const rutKeys = await Promise.all(activeRuts.map((rut) => getRutKey(rut.rut)))
            const holidayDates = new Set(holidays.map((holiday) => holiday.date))

            return buildHealthcheckDays(marcajes.items, activeRuts, rutKeys, holidayDates)
        }
    }))

    const refreshHealthcheck = async () => {
        await healthcheckQuery.refetch()
    }

    return {
        days: () => healthcheckQuery.data ?? [],
        isLoading: () => healthcheckQuery.isLoading,
        isFetching: () => healthcheckQuery.isFetching,
        isError: () => healthcheckQuery.isError,
        refreshHealthcheck
    }
}

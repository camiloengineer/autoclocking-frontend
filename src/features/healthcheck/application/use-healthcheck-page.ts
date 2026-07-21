import { createQuery } from '@tanstack/solid-query'
import { fetchHolidays } from '../../holidays/infra/holidays.api'
import { MARCAJES_HEALTHCHECK_LIMIT } from '../../marcajes/application/marcajes.constants'
import { fetchMarcajes } from '../../marcajes/infra/marcajes.api'
import { fetchAccounts } from '../../accounts/infra/accounts.api'
import { HEALTHCHECK_QUERY_KEY } from './healthcheck.constants'
import { buildHealthcheckDays } from '../domain/healthcheck.utils'

export function useHealthcheckPage() {
    const healthcheckQuery = createQuery(() => ({
        queryKey: HEALTHCHECK_QUERY_KEY,
        queryFn: async () => {
            const [marcajes, holidays, accounts] = await Promise.all([fetchMarcajes(MARCAJES_HEALTHCHECK_LIMIT), fetchHolidays(), fetchAccounts()])
            const activeAccounts = accounts.items.filter((account) => account.active)
            const holidayDates = new Set(holidays.map((holiday) => holiday.date))

            return buildHealthcheckDays(marcajes.items, activeAccounts, holidayDates)
        }
    }))

    const refreshHealthcheck = async () => {
        await healthcheckQuery.refetch()
    }

    return {
        days: () => healthcheckQuery.data?.days ?? [],
        today: () => healthcheckQuery.data?.today ?? null,
        isLoading: () => healthcheckQuery.isLoading,
        isFetching: () => healthcheckQuery.isFetching,
        isError: () => healthcheckQuery.isError,
        refreshHealthcheck
    }
}

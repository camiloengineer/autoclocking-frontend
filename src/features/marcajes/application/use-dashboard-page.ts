import { createMemo, createSignal } from 'solid-js'
import { createQuery } from '@tanstack/solid-query'
import { session } from '../../auth/application/auth-store'
import { fetchOwnersByEmail } from '../../ruts/infra/rut-owners.api'
import { getRutKey, maskRut } from '../../ruts/domain/rut.formatters'
import { summarizeMarcajes } from '../domain/marcaje.summary'
import type { MarcajeItem } from '../domain/marcaje.types'
import { MARCAJES_FEED_PAGE_SIZE, MARCAJES_LOOKBACK_DAYS, MARCAJES_OWNED_RUTS_QUERY_KEY } from './marcajes.constants'
import { useMarcajesStore } from './marcajes.store'

type OwnedRutMatchers = {
    keys: Set<string>
    masked: Set<string>
}

function belongsToOwner(item: MarcajeItem, matchers: OwnedRutMatchers): boolean {
    return item.rut_key ? matchers.keys.has(item.rut_key) : matchers.masked.has(item.rut_masked)
}

function getChileDateOffset(days: number) {
    const base = new Date()
    const chileToday = new Date(`${base.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })}T12:00:00-04:00`)
    chileToday.setDate(chileToday.getDate() - days)
    return chileToday.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
}

function isWithinLookbackWindow(item: MarcajeItem) {
    const itemDate = (item.fecha_clt || item.created_at).slice(0, 10)
    return itemDate >= getChileDateOffset(MARCAJES_LOOKBACK_DAYS - 1)
}

export function useDashboardPage() {
    const marcajesStore = useMarcajesStore()

    const isAdmin = createMemo(() => session()?.isAdmin ?? false)
    const email = createMemo(() => session()?.email ?? '')
    const isScopedUser = createMemo(() => Boolean(session()) && !isAdmin())

    const ownedRutsQuery = createQuery(() => ({
        queryKey: [...MARCAJES_OWNED_RUTS_QUERY_KEY, email()],
        queryFn: async (): Promise<OwnedRutMatchers> => {
            const owners = await fetchOwnersByEmail(email())
            const keys = await Promise.all(owners.map((owner) => getRutKey(owner.rut)))
            return { keys: new Set(keys), masked: new Set(owners.map((owner) => maskRut(owner.rut))) }
        },
        enabled: isScopedUser()
    }))

    const scopedRecords = createMemo(() => {
        const all = marcajesStore.records()
        if (!isScopedUser()) {
            return all
        }

        const matchers = ownedRutsQuery.data
        if (!matchers) {
            return []
        }

        return all.filter((item) => belongsToOwner(item, matchers))
    })

    const visibleRecords = createMemo(() => summarizeMarcajes(scopedRecords().filter(isWithinLookbackWindow)))
    const totalVisible = createMemo(() => visibleRecords().length)
    const hasRecords = createMemo(() => totalVisible() > 0)
    const totalPages = createMemo(() => Math.max(1, Math.ceil(totalVisible() / MARCAJES_FEED_PAGE_SIZE)))

    const [requestedPage, setRequestedPage] = createSignal(1)
    const page = createMemo(() => Math.min(Math.max(requestedPage(), 1), totalPages()))

    const rangeStart = createMemo(() => (totalVisible() === 0 ? 0 : (page() - 1) * MARCAJES_FEED_PAGE_SIZE + 1))
    const rangeEnd = createMemo(() => Math.min(page() * MARCAJES_FEED_PAGE_SIZE, totalVisible()))
    const records = createMemo(() => visibleRecords().slice((page() - 1) * MARCAJES_FEED_PAGE_SIZE, page() * MARCAJES_FEED_PAGE_SIZE))

    const nextPage = () => setRequestedPage(page() + 1)
    const prevPage = () => setRequestedPage(page() - 1)

    const refresh = async () => {
        await Promise.all([marcajesStore.refresh(), ownedRutsQuery.refetch()])
    }

    return {
        records,
        page,
        totalPages,
        totalVisible,
        rangeStart,
        rangeEnd,
        nextPage,
        prevPage,
        isLoading: () => marcajesStore.isLoading() || (isScopedUser() && ownedRutsQuery.isLoading),
        isRefetching: marcajesStore.isRefetching,
        hasRecords,
        refresh
    }
}

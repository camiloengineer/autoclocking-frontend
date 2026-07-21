import { createMemo, createSignal } from 'solid-js'
import { session } from '../../auth/application/auth-store'
import { maskEmail } from '../../accounts/domain/account.formatters'
import { summarizeMarcajes } from '../domain/marcaje.summary'
import type { MarcajeItem } from '../domain/marcaje.types'
import { MARCAJES_FEED_PAGE_SIZE, MARCAJES_LOOKBACK_DAYS } from './marcajes.constants'
import { useMarcajesStore } from './marcajes.store'

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

    const scopedRecords = createMemo(() => {
        const all = marcajesStore.records()
        if (!isScopedUser()) {
            return all
        }

        const ownMasked = maskEmail(email())
        return all.filter((item) => item.email_masked === ownMasked)
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
        await marcajesStore.refresh()
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
        isLoading: () => marcajesStore.isLoading(),
        isRefetching: marcajesStore.isRefetching,
        hasRecords,
        refresh
    }
}

import { createMemo, createSignal } from 'solid-js'
import { summarizeMarcajes } from '../domain/marcaje.summary'
import { MARCAJES_FEED_PAGE_SIZE } from './marcajes.constants'
import { useMarcajesStore } from './marcajes.store'

export function useDashboardPage() {
    const marcajesStore = useMarcajesStore()

    const visibleRecords = createMemo(() => summarizeMarcajes(marcajesStore.records()))
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
        isLoading: marcajesStore.isLoading,
        isRefetching: marcajesStore.isRefetching,
        hasRecords,
        refresh
    }
}

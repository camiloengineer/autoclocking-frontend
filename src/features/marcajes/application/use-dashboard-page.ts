import { createMemo } from 'solid-js'
import { useMarcajesStore } from './marcajes.store'

export function useDashboardPage() {
    const marcajesStore = useMarcajesStore()

    const hasRecords = createMemo(() => marcajesStore.records().length > 0)

    const refresh = async () => {
        await marcajesStore.refresh()
    }

    return {
        records: marcajesStore.records,
        isLoading: marcajesStore.isLoading,
        isRefetching: marcajesStore.isRefetching,
        hasRecords,
        refresh
    }
}

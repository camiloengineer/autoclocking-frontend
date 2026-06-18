import { createContext, createMemo, useContext, type Accessor, type JSX } from 'solid-js'
import { createQuery } from '@tanstack/solid-query'
import type { MarcajeItem } from '../domain/marcaje.types'
import { fetchMarcajes } from '../infra/marcajes.api'
import { MARCAJES_QUERY_KEY, MARCAJES_REFRESH_INTERVAL_MS } from './marcajes.constants'

type MarcajesStore = {
    records: Accessor<MarcajeItem[]>
    refresh: () => Promise<unknown>
    isLoading: Accessor<boolean>
    isRefetching: Accessor<boolean>
}

const MarcajesStoreContext = createContext<MarcajesStore>()

type MarcajesProviderProps = {
    children: JSX.Element
}

export function MarcajesProvider(props: MarcajesProviderProps) {
    const marcajesQuery = createQuery(() => ({
        queryKey: MARCAJES_QUERY_KEY,
        queryFn: () => fetchMarcajes(),
        refetchInterval: MARCAJES_REFRESH_INTERVAL_MS
    }))

    const records = createMemo(() => marcajesQuery.data?.items ?? [])
    const isLoading = createMemo(() => marcajesQuery.isLoading)
    const isRefetching = createMemo(() => marcajesQuery.isRefetching)

    const store: MarcajesStore = {
        records,
        refresh: () => marcajesQuery.refetch(),
        isLoading,
        isRefetching
    }

    return <MarcajesStoreContext.Provider value={store}>{props.children}</MarcajesStoreContext.Provider>
}

export function useMarcajesStore() {
    const store = useContext(MarcajesStoreContext)
    if (!store) {
        throw new Error('MarcajesStoreContext is missing')
    }

    return store
}

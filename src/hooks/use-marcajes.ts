import { createQuery } from '@tanstack/solid-query'
import { fetchMarcajes } from '../services/marcajes.api'

export function useMarcajes() {
    return createQuery(() => ({
        queryKey: ['marcajes'],
        queryFn: () => fetchMarcajes(),
        refetchInterval: 60_000
    }))
}

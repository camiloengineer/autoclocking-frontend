import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import type { JSX } from 'solid-js'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: true,
            staleTime: 30_000
        }
    }
})

type QueryProviderProps = {
    children: JSX.Element
}

export function QueryProvider(props: QueryProviderProps) {
    return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
}

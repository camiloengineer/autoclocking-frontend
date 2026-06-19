import { createMemo, createSignal } from 'solid-js'
import { APP_NAV_ITEMS, APP_REPOSITORY_LINKS, type AppPage } from './app-shell.constants'

export function useAppShell() {
    const [activePage, setActivePage] = createSignal<AppPage>('dashboard')

    const navigationItems = createMemo(() =>
        APP_NAV_ITEMS.map((item) => ({
            ...item,
            active: item.id === activePage()
        }))
    )

    return {
        activePage,
        setActivePage,
        navigationItems,
        repositoryLinks: APP_REPOSITORY_LINKS
    }
}

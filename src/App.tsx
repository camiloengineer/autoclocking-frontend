import { SquareArrowOutUpRight } from 'lucide-solid'
import { For, Show } from 'solid-js'
import { siGithub } from 'simple-icons'
import { useAppShell } from './app/application/use-app-shell'
import { DashboardPage } from './pages/dashboard-page'
import { HealthcheckPage } from './pages/healthcheck-page'
import { HolidaysPage } from './pages/holidays-page'
import { RutsPage } from './pages/ruts-page'

function GithubMark() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={siGithub.path} fill="currentColor" />
        </svg>
    )
}

function App() {
    const appShell = useAppShell()

    return (
        <div class="app-shell">
            <header class="app-header">
                <nav class="app-header__tabs" aria-label="Application sections">
                    <For each={appShell.navigationItems()}>
                        {(item) => (
                            <button classList={{ 'app-header__tab--active': item.active }} type="button" onClick={() => appShell.setActivePage(item.id)}>
                                {item.label}
                            </button>
                        )}
                    </For>
                </nav>
                <nav class="app-header__links" aria-label="Project repositories">
                    <For each={appShell.repositoryLinks}>
                        {(item) => (
                            <a href={item.href} target="_blank" rel="noreferrer">
                                <GithubMark />
                                <span>{item.label}</span>
                                <SquareArrowOutUpRight size={14} aria-hidden="true" />
                            </a>
                        )}
                    </For>
                </nav>
            </header>
            <Show when={appShell.activePage() === 'dashboard'}>
                <DashboardPage />
            </Show>
            <Show when={appShell.activePage() === 'ruts'}>
                <RutsPage />
            </Show>
            <Show when={appShell.activePage() === 'holidays'}>
                <HolidaysPage />
            </Show>
            <Show when={appShell.activePage() === 'healthcheck'}>
                <HealthcheckPage />
            </Show>
        </div>
    )
}

export default App

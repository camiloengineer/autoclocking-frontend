import { SquareArrowOutUpRight } from 'lucide-solid'
import { createSignal } from 'solid-js'
import { siGithub } from 'simple-icons'
import { DashboardPage } from './pages/dashboard-page'
import { RutsPage } from './pages/ruts-page'

function GithubMark() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={siGithub.path} fill="currentColor" />
        </svg>
    )
}

function App() {
    const [activePage, setActivePage] = createSignal<'dashboard' | 'ruts'>('dashboard')

    return (
        <div class="app-shell">
            <header class="app-header">
                <nav class="app-header__tabs" aria-label="Application sections">
                    <button classList={{ 'app-header__tab--active': activePage() === 'dashboard' }} type="button" onClick={() => setActivePage('dashboard')}>
                        Marcajes
                    </button>
                    <button classList={{ 'app-header__tab--active': activePage() === 'ruts' }} type="button" onClick={() => setActivePage('ruts')}>
                        RUTs
                    </button>
                </nav>
                <nav class="app-header__links" aria-label="Project repositories">
                    <a href="https://github.com/camiloengineer/autoclocking-backend/" target="_blank" rel="noreferrer">
                        <GithubMark />
                        <span>backend repo</span>
                        <SquareArrowOutUpRight size={14} aria-hidden="true" />
                    </a>
                    <a href="https://github.com/camiloengineer/autoclocking-frontend/" target="_blank" rel="noreferrer">
                        <GithubMark />
                        <span>frontend repo</span>
                        <SquareArrowOutUpRight size={14} aria-hidden="true" />
                    </a>
                </nav>
            </header>
            {activePage() === 'dashboard' ? <DashboardPage /> : <RutsPage />}
        </div>
    )
}

export default App

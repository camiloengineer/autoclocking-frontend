import { LogIn, LogOut, ShieldCheck, SquareArrowOutUpRight, UserRound } from 'lucide-solid'
import { For, Show } from 'solid-js'
import { siGithub } from 'simple-icons'
import { useAppShell } from './app/application/use-app-shell'
import { handleSignIn, handleSignOut, session, status } from './features/auth/application/auth-store'
import { DashboardPage } from './pages/dashboard-page'
import { HealthcheckPage } from './pages/healthcheck-page'
import { HolidaysPage } from './pages/holidays-page'
import { RutsPage } from './pages/ruts-page'
import { AccessGate } from './components/ui/access-gate'
import { LoadingState } from './components/ui/loading-state'
import { ToastHost } from './components/ui/toast-host'

function GithubMark() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={siGithub.path} fill="currentColor" />
        </svg>
    )
}

function App() {
    const appShell = useAppShell()

    const isSignedIn = () => Boolean(session())

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
                <div class="app-header__meta">
                    <div class="app-header__session">
                        <Show
                            when={session()}
                            fallback={
                                <Show when={status() !== 'loading'}>
                                    <button class="terminal-button terminal-button--icon" type="button" onClick={handleSignIn}>
                                        <LogIn size={16} aria-hidden="true" />
                                        <span>Continuar con Google</span>
                                    </button>
                                </Show>
                            }
                        >
                            {(currentSession) => (
                                <>
                                    <span class="rut-session">
                                        {currentSession().isAdmin ? <ShieldCheck size={14} aria-hidden="true" /> : <UserRound size={14} aria-hidden="true" />}
                                        <span>{currentSession().email}</span>
                                        <span class="rut-session__role">{currentSession().isAdmin ? 'Administrador' : 'Usuario'}</span>
                                    </span>
                                    <button class="terminal-button terminal-button--icon" type="button" onClick={handleSignOut}>
                                        <LogOut size={16} aria-hidden="true" />
                                        <span>Salir</span>
                                    </button>
                                </>
                            )}
                        </Show>
                    </div>
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
                </div>
            </header>

            <div class="app-content">
                <div class="app-content__view" classList={{ 'app-content__view--gated': !isSignedIn() }} inert={!isSignedIn() || undefined}>
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
                <Show when={!isSignedIn()}>
                    <Show when={status() === 'signed-out'} fallback={<div class="access-gate"><LoadingState withShell={false} /></div>}>
                        <AccessGate
                            title="Acceso restringido"
                            hint="Inicia sesión con tu cuenta de Google autorizada para ver tus marcajes."
                            onSignIn={handleSignIn}
                        />
                    </Show>
                </Show>
            </div>

            <ToastHost />
        </div>
    )
}

export default App

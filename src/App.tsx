import { A, Route, Router, useLocation, type RouteSectionProps } from '@solidjs/router'
import { ChevronDown, LogIn, LogOut, SquareArrowOutUpRight, UserRound } from 'lucide-solid'
import { createSignal, For, Show, type JSX } from 'solid-js'
import { siGithub } from 'simple-icons'
import { APP_NAV_ITEMS, APP_REPOSITORY_LINKS } from './app/application/app-shell.constants'
import { AccessGate } from './components/ui/access-gate'
import { LoadingState } from './components/ui/loading-state'
import { ToastHost } from './components/ui/toast-host'
import { handleSignIn, handleSignOut, session, status } from './features/auth/application/auth-store'
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

function isClockInsPath(pathname: string) {
    return pathname === '/' || pathname === '/clock-ins'
}

function ProtectedView(props: { children: JSX.Element }) {
    const isAccessRestricted = () => !session()

    return (
        <div class="app-content">
            <div class="app-content__view" classList={{ 'app-content__view--gated': isAccessRestricted() }} inert={isAccessRestricted() || undefined}>
                {props.children}
            </div>
            <Show when={isAccessRestricted()}>
                <Show when={status() === 'signed-out'} fallback={<div class="access-gate"><LoadingState withShell={false} /></div>}>
                    <AccessGate title="Restricted section" hint="Sign in with an authorized Google account to view private automation data." onSignIn={handleSignIn} />
                </Show>
            </Show>
        </div>
    )
}

function PublicView(props: { children: JSX.Element }) {
    return <div class="app-content">{props.children}</div>
}

function AppLayout(props: RouteSectionProps) {
    const location = useLocation()
    const isCurrentPath = (path: string) => (path === '/clock-ins' ? isClockInsPath(location.pathname) : location.pathname === path)
    const [isAccountMenuOpen, setIsAccountMenuOpen] = createSignal(false)

    return (
        <div class="app-shell">
            <header class="app-header">
                <div class="app-header__topline">
                    <nav class="app-header__tabs" aria-label="Application sections">
                        <For each={APP_NAV_ITEMS}>
                            {(item) => (
                                <A class="app-header__tab" classList={{ 'app-header__tab--active': isCurrentPath(item.path) }} href={item.path}>
                                    {item.label}
                                </A>
                            )}
                        </For>
                    </nav>

                    <div class="app-header__session">
                        <Show
                            when={session()}
                            fallback={
                                <button class="account-action" type="button" onClick={handleSignIn}>
                                    <LogIn size={16} aria-hidden="true" />
                                    <span>Sign in</span>
                                </button>
                            }
                        >
                            {(currentSession) => (
                                <div class="account-menu">
                                    <button
                                        class="account-chip"
                                        type="button"
                                        aria-haspopup="menu"
                                        aria-expanded={isAccountMenuOpen()}
                                        onClick={() => setIsAccountMenuOpen((open) => !open)}
                                    >
                                        <span class="account-chip__icon">
                                            <UserRound size={17} aria-hidden="true" />
                                        </span>
                                        <span class="account-chip__identity">
                                            <strong>{currentSession().displayName || 'Authorized user'}</strong>
                                            <span>{currentSession().email}</span>
                                        </span>
                                        <ChevronDown class="account-chip__caret" size={16} aria-hidden="true" />
                                    </button>
                                    <Show when={isAccountMenuOpen()}>
                                        <button class="account-menu__backdrop" type="button" aria-label="Close account menu" onClick={() => setIsAccountMenuOpen(false)} />
                                        <div class="account-menu__dropdown" role="menu">
                                            <button
                                                class="account-menu__item account-menu__item--danger"
                                                type="button"
                                                role="menuitem"
                                                onClick={() => {
                                                    setIsAccountMenuOpen(false)
                                                    handleSignOut()
                                                }}
                                            >
                                                <LogOut size={16} aria-hidden="true" />
                                                <span>Sign out</span>
                                            </button>
                                        </div>
                                    </Show>
                                </div>
                            )}
                        </Show>
                    </div>
                </div>
            </header>

            {props.children}

            <footer class="app-footer">
                <span>Project repositories</span>
                <nav class="app-footer__links" aria-label="Project repositories">
                    <For each={APP_REPOSITORY_LINKS}>
                        {(item) => (
                            <a href={item.href} target="_blank" rel="noreferrer">
                                <GithubMark />
                                <span>{item.label}</span>
                                <SquareArrowOutUpRight size={12} aria-hidden="true" />
                            </a>
                        )}
                    </For>
                </nav>
            </footer>

            <ToastHost />
        </div>
    )
}

function App() {
    return (
        <Router root={AppLayout}>
            <Route
                path={['/', '/clock-ins']}
                component={() => (
                    <ProtectedView>
                        <DashboardPage />
                    </ProtectedView>
                )}
            />
            <Route
                path="/ruts"
                component={() => (
                    <ProtectedView>
                        <RutsPage />
                    </ProtectedView>
                )}
            />
            <Route
                path="/holidays"
                component={() => (
                    <PublicView>
                        <HolidaysPage />
                    </PublicView>
                )}
            />
            <Route
                path="/healthcheck"
                component={() => (
                    <PublicView>
                        <HealthcheckPage />
                    </PublicView>
                )}
            />
        </Router>
    )
}

export default App

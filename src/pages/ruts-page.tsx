import { For, Show } from 'solid-js'
import { LogIn, LogOut, Lock, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-solid'
import { EmptyState } from '../components/ui/empty-state'
import { LoadingState } from '../components/ui/loading-state'
import { PanelHeader } from '../components/ui/panel-header'
import { RefreshButton } from '../components/ui/refresh-button'
import { handleSignIn, handleSignOut, session, status } from '../features/auth/application/auth-store'
import { useRutsPage } from '../features/ruts/application/use-ruts-page'
import { formatUpdatedAt, maskRut } from '../features/ruts/domain/rut.formatters'

function SignInGate() {
    return (
        <main class="dashboard-shell dashboard-shell--gated">
            <div class="access-gate">
                <div class="access-gate__card">
                    <span class="access-gate__icon">
                        <Lock size={22} aria-hidden="true" />
                    </span>
                    <h2 class="access-gate__title">Mantenedor restringido</h2>
                    <p class="access-gate__hint">Inicia sesión con tu cuenta de Google autorizada para administrar RUTs.</p>
                    <button class="terminal-button terminal-button--icon" type="button" onClick={handleSignIn}>
                        <LogIn size={16} aria-hidden="true" />
                        <span>Continuar con Google</span>
                    </button>
                </div>
            </div>
            <section class="panel history-panel" inert>
                <PanelHeader title="RUT administration" detail="Sesión requerida" />
            </section>
        </main>
    )
}

function RutsManager() {
    const rutsPage = useRutsPage()

    return (
        <main class="dashboard-shell">
            <section class="panel history-panel">
                <PanelHeader
                    title="RUT administration"
                    detail={
                        <span class="rut-session">
                            {rutsPage.isAdmin() ? <ShieldCheck size={14} aria-hidden="true" /> : <UserRound size={14} aria-hidden="true" />}
                            <span>{session()?.email}</span>
                            <span class="rut-session__role">{rutsPage.isAdmin() ? 'Administrador' : 'Usuario'}</span>
                        </span>
                    }
                    action={
                        <div class="panel-actions">
                            <RefreshButton busy={rutsPage.isFetching()} onClick={rutsPage.refreshRuts} />
                            <button class="terminal-button terminal-button--icon" type="button" onClick={handleSignOut}>
                                <LogOut size={16} aria-hidden="true" />
                                <span>Salir</span>
                            </button>
                        </div>
                    }
                />

                <Show when={rutsPage.isAdmin()}>
                    <form class="rut-form rut-form--admin" onSubmit={rutsPage.handleSubmit}>
                        <label class="rut-form__field">
                            <span>RUT</span>
                            <input value={rutsPage.rut()} onInput={(event) => rutsPage.setRut(event.currentTarget.value)} placeholder="12345676-K" required />
                        </label>
                        <label class="rut-form__field">
                            <span>Owner email</span>
                            <input
                                type="email"
                                value={rutsPage.ownerEmail()}
                                onInput={(event) => rutsPage.setOwnerEmail(event.currentTarget.value)}
                                placeholder="dueno@dominio.com"
                                autocomplete="email"
                                required
                            />
                        </label>
                        <label class="rut-form__check">
                            <input type="checkbox" checked={rutsPage.active()} onChange={(event) => rutsPage.setActive(event.currentTarget.checked)} />
                            <span>Active</span>
                        </label>
                        <button class="terminal-button terminal-button--icon" type="submit" disabled={rutsPage.pendingAction() === 'save'}>
                            <Plus size={16} aria-hidden="true" />
                            <span>{rutsPage.pendingAction() === 'save' ? 'Saving' : 'Add RUT'}</span>
                        </button>
                    </form>
                </Show>

                <Show when={!rutsPage.isLoading()} fallback={<LoadingState />}>
                    <Show
                        when={rutsPage.rows().length > 0}
                        fallback={
                            <EmptyState
                                title="No RUTs configured"
                                description={rutsPage.isAdmin() ? 'Add a RUT to make it available for the scheduled marcaje job.' : 'Aún no tienes un RUT asignado. Contacta al administrador.'}
                            />
                        }
                    >
                        <div class="table-shell">
                            <table class="history-table rut-table">
                                <thead>
                                    <tr>
                                        <th>RUT</th>
                                        <Show when={rutsPage.isAdmin()}>
                                            <th>Owner</th>
                                        </Show>
                                        <th>Status</th>
                                        <th>Updated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={rutsPage.rows()}>
                                        {(item) => (
                                            <tr>
                                                <td>{maskRut(item.rut)}</td>
                                                <Show when={rutsPage.isAdmin()}>
                                                    <td>
                                                        <input
                                                            class="rut-owner-input"
                                                            type="email"
                                                            value={item.ownerEmail}
                                                            placeholder="sin dueño"
                                                            disabled={rutsPage.pendingAction() === `reassign:${item.rut}`}
                                                            onChange={(event) => rutsPage.handleReassign(item.rut, event.currentTarget.value)}
                                                        />
                                                    </td>
                                                </Show>
                                                <td>
                                                    <label class="rut-toggle">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.active}
                                                            disabled={rutsPage.pendingAction() === `toggle:${item.rut}`}
                                                            onChange={(event) => rutsPage.handleToggle(item.rut, event.currentTarget.checked)}
                                                        />
                                                        <span>{item.active ? 'Active' : 'Inactive'}</span>
                                                    </label>
                                                </td>
                                                <td>{formatUpdatedAt(item.updated_at)}</td>
                                                <td>
                                                    <button
                                                        class="icon-button"
                                                        type="button"
                                                        aria-label={`Delete ${maskRut(item.rut)}`}
                                                        disabled={rutsPage.pendingAction() === `delete:${item.rut}`}
                                                        onClick={() => rutsPage.handleDelete(item.rut)}
                                                    >
                                                        <Trash2 size={16} aria-hidden="true" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </For>
                                </tbody>
                            </table>
                        </div>
                    </Show>
                </Show>
            </section>
        </main>
    )
}

export function RutsPage() {
    return (
        <Show when={status() !== 'loading'} fallback={<main class="dashboard-shell"><LoadingState /></main>}>
            <Show when={session()} fallback={<SignInGate />}>
                <RutsManager />
            </Show>
        </Show>
    )
}

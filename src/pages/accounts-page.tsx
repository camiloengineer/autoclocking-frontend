import { For, Show } from 'solid-js'
import { Plus, Trash2 } from 'lucide-solid'
import { EmptyState } from '../components/ui/empty-state'
import { LoadingState } from '../components/ui/loading-state'
import { PanelHeader } from '../components/ui/panel-header'
import { RefreshButton } from '../components/ui/refresh-button'
import { ToggleSwitch } from '../components/ui/toggle-switch'
import { useAccountsPage } from '../features/accounts/application/use-accounts-page'
import { formatUpdatedAt } from '../features/accounts/domain/account.formatters'

export function AccountsPage() {
    const accountsPage = useAccountsPage()

    return (
        <main class="dashboard-shell">
            <section class="panel history-panel">
                <PanelHeader
                    title="Account administration"
                    detail={accountsPage.isAdmin() ? 'Buk accounts used for automated clocking' : 'Sign in with an admin account to manage Buk credentials'}
                    action={<RefreshButton busy={accountsPage.isFetching()} onClick={accountsPage.refreshAccounts} />}
                />

                <Show when={accountsPage.isAdmin()}>
                    <form class="rut-form rut-form--admin" onSubmit={accountsPage.handleSubmit}>
                        <label class="rut-form__field">
                            <span>Corporate email</span>
                            <input
                                type="email"
                                value={accountsPage.email()}
                                onInput={(event) => accountsPage.setEmail(event.currentTarget.value)}
                                placeholder="name@robotia.cl"
                                autocomplete="email"
                                required
                            />
                        </label>
                        <label class="rut-form__field">
                            <span>Buk password</span>
                            <input
                                type="password"
                                value={accountsPage.password()}
                                onInput={(event) => accountsPage.setPassword(event.currentTarget.value)}
                                placeholder="••••••••"
                                autocomplete="off"
                                required
                            />
                        </label>
                        <ToggleSwitch checked={accountsPage.active()} label="Enabled" onChange={accountsPage.setActive} />
                        <button class="terminal-button terminal-button--icon" type="submit" disabled={accountsPage.pendingAction() === 'save'}>
                            <Plus size={16} aria-hidden="true" />
                            <span>{accountsPage.pendingAction() === 'save' ? 'Validating' : 'Add account'}</span>
                        </button>
                    </form>
                </Show>

                <Show when={!accountsPage.isLoading()} fallback={<LoadingState />}>
                    <Show
                        when={accountsPage.isAdmin()}
                        fallback={<EmptyState title="Admin only" description="Account management is restricted to administrators." />}
                    >
                        <Show
                            when={accountsPage.rows().length > 0}
                            fallback={<EmptyState title="No accounts configured" description="Add a Buk account (email + password) to enable the scheduled clocking job." />}
                        >
                            <div class="table-shell">
                                <table class="history-table rut-table">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Job ID</th>
                                            <th>Status</th>
                                            <th>Updated</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <For each={accountsPage.rows()}>
                                            {(item) => (
                                                <tr>
                                                    <td>{item.email}</td>
                                                    <td>{item.job_id || '—'}</td>
                                                    <td>
                                                        <ToggleSwitch
                                                            checked={item.active}
                                                            label="Enabled"
                                                            disabled={accountsPage.pendingAction() === `toggle:${item.email}`}
                                                            onChange={(next) => accountsPage.handleToggle(item.email, next)}
                                                        />
                                                    </td>
                                                    <td>{formatUpdatedAt(item.updated_at)}</td>
                                                    <td>
                                                        <button
                                                            class="icon-button"
                                                            type="button"
                                                            aria-label={`Delete ${item.email}`}
                                                            disabled={accountsPage.pendingAction() === `delete:${item.email}`}
                                                            onClick={() => accountsPage.handleDelete(item.email)}
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
                </Show>
            </section>
        </main>
    )
}

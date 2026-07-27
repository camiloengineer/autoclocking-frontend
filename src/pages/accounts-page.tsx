import { For, Show } from 'solid-js'
import { Trash2 } from 'lucide-solid'
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
                    title={accountsPage.isAdmin() ? 'Account administration' : 'Your clocking account'}
                    detail={
                        accountsPage.isAdmin()
                            ? 'All Buk accounts used for automated clocking'
                            : 'Signing in registered this account for automated clocking. Pause it with the toggle, or delete it to opt out.'
                    }
                    action={<RefreshButton busy={accountsPage.isFetching()} onClick={accountsPage.refreshAccounts} />}
                />

                <Show when={!accountsPage.isLoading()} fallback={<LoadingState />}>
                    <Show
                        when={accountsPage.rows().length > 0}
                        fallback={
                            <EmptyState
                                title="No account registered"
                                description={
                                    accountsPage.isAdmin()
                                        ? 'Accounts appear here when their owners sign in with valid Buk credentials.'
                                        : 'Your account is no longer registered. Sign out and sign back in to re-register it.'
                                }
                            />
                        }
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
            </section>
        </main>
    )
}

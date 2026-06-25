import { For, Show } from 'solid-js'
import { Plus, Trash2 } from 'lucide-solid'
import { EmptyState } from '../components/ui/empty-state'
import { LoadingState } from '../components/ui/loading-state'
import { PanelHeader } from '../components/ui/panel-header'
import { RefreshButton } from '../components/ui/refresh-button'
import { useRutsPage } from '../features/ruts/application/use-ruts-page'
import { formatUpdatedAt, maskRut } from '../features/ruts/domain/rut.formatters'

export function RutsPage() {
    const rutsPage = useRutsPage()

    return (
        <main class="dashboard-shell">
            <section class="panel history-panel">
                <PanelHeader
                    title="RUT administration"
                    detail={`${rutsPage.activeCount()} active of ${rutsPage.items().length} configured RUTs`}
                    action={<RefreshButton busy={rutsPage.isFetching()} onClick={rutsPage.refreshRuts} />}
                />

                <form class="rut-form" onSubmit={rutsPage.handleSubmit}>
                    <label class="rut-form__field">
                        <span>RUT</span>
                        <input value={rutsPage.rut()} onInput={(event) => rutsPage.setRut(event.currentTarget.value)} placeholder="12345676-K" required />
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

                <Show
                    when={!rutsPage.isLoading()}
                    fallback={<LoadingState />}
                >
                    <Show
                        when={rutsPage.items().length > 0}
                        fallback={<EmptyState title="No RUTs configured" description="Add a RUT to make it available for the scheduled marcaje job." />}
                    >
                        <div class="table-shell">
                            <table class="history-table rut-table">
                                <thead>
                                    <tr>
                                        <th>RUT</th>
                                        <th>Status</th>
                                        <th>Updated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <For each={rutsPage.items()}>
                                        {(item) => (
                                            <tr>
                                                <td>{maskRut(item.rut)}</td>
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

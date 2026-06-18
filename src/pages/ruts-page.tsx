import { For, Show, createSignal } from 'solid-js'
import { Plus, RefreshCw, Trash2 } from 'lucide-solid'
import { createQuery, useQueryClient } from '@tanstack/solid-query'
import { deleteRut, fetchRuts, saveRut, updateRutActive } from '../features/ruts/infra/ruts.api'

const RUTS_QUERY_KEY = ['ruts'] as const
const UPDATED_AT_FORMATTER = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Santiago'
})

function maskRut(value: string) {
    const normalized = value.trim()
    if (normalized.length <= 4) {
        return '*'.repeat(normalized.length)
    }

    return `${normalized.slice(0, 4)}${'*'.repeat(normalized.length - 4)}`
}

function formatUpdatedAt(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'No timestamp'
    }

    return UPDATED_AT_FORMATTER.format(date)
}

export function RutsPage() {
    const queryClient = useQueryClient()
    const [rut, setRut] = createSignal('')
    const [active, setActive] = createSignal(true)
    const [pendingAction, setPendingAction] = createSignal('')
    const [error, setError] = createSignal('')

    const rutsQuery = createQuery(() => ({
        queryKey: RUTS_QUERY_KEY,
        queryFn: () => fetchRuts()
    }))

    const refreshRuts = async () => {
        setError('')
        await rutsQuery.refetch()
    }

    const invalidateRuts = async () => {
        await queryClient.invalidateQueries({ queryKey: RUTS_QUERY_KEY })
    }

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault()
        setError('')
        setPendingAction('save')

        try {
            await saveRut(rut(), active())
            setRut('')
            setActive(true)
            await invalidateRuts()
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Unable to save RUT')
        } finally {
            setPendingAction('')
        }
    }

    const handleToggle = async (targetRut: string, nextActive: boolean) => {
        setError('')
        setPendingAction(`toggle:${targetRut}`)

        try {
            await updateRutActive(targetRut, nextActive)
            await invalidateRuts()
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : 'Unable to update RUT')
        } finally {
            setPendingAction('')
        }
    }

    const handleDelete = async (targetRut: string) => {
        setError('')
        setPendingAction(`delete:${targetRut}`)

        try {
            await deleteRut(targetRut)
            await invalidateRuts()
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete RUT')
        } finally {
            setPendingAction('')
        }
    }

    const items = () => rutsQuery.data?.items ?? []
    const activeCount = () => items().filter((item) => item.active).length

    return (
        <main class="dashboard-shell">
            <section class="panel history-panel">
                <div class="panel-header">
                    <div>
                        <h2>RUT administration</h2>
                        <p class="panel-detail">{activeCount()} active of {items().length} configured RUTs</p>
                    </div>
                    <button class="terminal-button terminal-button--icon" type="button" onClick={refreshRuts} disabled={rutsQuery.isFetching}>
                        <RefreshCw size={16} aria-hidden="true" />
                        <span>{rutsQuery.isFetching ? 'Refreshing' : 'Refresh'}</span>
                    </button>
                </div>

                <form class="rut-form" onSubmit={handleSubmit}>
                    <label class="rut-form__field">
                        <span>RUT</span>
                        <input value={rut()} onInput={(event) => setRut(event.currentTarget.value)} placeholder="12345676-K" required />
                    </label>
                    <label class="rut-form__check">
                        <input type="checkbox" checked={active()} onChange={(event) => setActive(event.currentTarget.checked)} />
                        <span>Active</span>
                    </label>
                    <button class="terminal-button terminal-button--icon" type="submit" disabled={pendingAction() === 'save'}>
                        <Plus size={16} aria-hidden="true" />
                        <span>{pendingAction() === 'save' ? 'Saving' : 'Add RUT'}</span>
                    </button>
                </form>

                <Show when={error()}>
                    <p class="rut-error">{error()}</p>
                </Show>

                <Show
                    when={!rutsQuery.isLoading}
                    fallback={
                        <div class="history-fallback">
                            <div class="loading-grid" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    }
                >
                    <Show
                        when={items().length > 0}
                        fallback={
                            <div class="empty-state">
                                <h3>No RUTs configured</h3>
                                <p>Add a RUT to make it available for the scheduled marcaje job.</p>
                            </div>
                        }
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
                                    <For each={items()}>
                                        {(item) => (
                                            <tr>
                                                <td>{maskRut(item.rut)}</td>
                                                <td>
                                                    <label class="rut-toggle">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.active}
                                                            disabled={pendingAction() === `toggle:${item.rut}`}
                                                            onChange={(event) => handleToggle(item.rut, event.currentTarget.checked)}
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
                                                        disabled={pendingAction() === `delete:${item.rut}`}
                                                        onClick={() => handleDelete(item.rut)}
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

import { createMemo, Show } from 'solid-js'
import { HistoryTable } from '../components/history-table'
import { StatusBadge } from '../components/status-badge'
import { useMarcajes } from '../hooks/use-marcajes'
import { formatActionLabel, formatCreatedAt, formatStatusLabel, getActionTone, getLatestRecord, getStatusTone, summarizeStatuses } from '../utils/formatters'

export function DashboardPage() {
    const marcajesQuery = useMarcajes()

    const records = createMemo(() => marcajesQuery.data?.items ?? [])
    const recordCount = createMemo(() => marcajesQuery.data?.count ?? 0)
    const latestRecord = createMemo(() => getLatestRecord(records()))
    const statusSummary = createMemo(() => summarizeStatuses(records()))

    const handleRefresh = async () => {
        await marcajesQuery.refetch()
    }

    return (
        <main class="dashboard-shell">
            <section class="hero-panel panel">
                <div class="hero-panel__content">
                    <div>
                        <div class="hero-panel__title">
                            <img class="hero-panel__icon" src="/biohazard.svg" alt="" aria-hidden="true" />
                            <h1>AutoClocking</h1>
                        </div>
                        <p class="hero-panel__lead">Operational history for automatic clocking events.</p>
                    </div>
                    <div class="hero-panel__actions">
                        <button class="terminal-button" type="button" onClick={handleRefresh} disabled={marcajesQuery.isRefetching}>
                            {marcajesQuery.isRefetching ? 'Refreshing...' : 'Refresh now'}
                        </button>
                    </div>
                </div>
            </section>

            <section class="content-grid">
                <article class="panel spotlight-panel">
                    <div class="panel-header">
                        <div>
                            <span class="panel-label">Latest detected event</span>
                            <h2>Most recent record</h2>
                        </div>
                        <Show when={latestRecord()}>
                            {(record) => <StatusBadge tone={getStatusTone(record().status)}>{formatStatusLabel(record().status)}</StatusBadge>}
                        </Show>
                    </div>

                    <Show
                        when={latestRecord()}
                        fallback={
                            <div class="empty-state">
                                <span class="empty-state__icon">[ empty ]</span>
                                <h3>No clocking records loaded yet</h3>
                                <p>The endpoint is live, but it is not returning records right now. The UI is ready to display the first event as soon as it exists.</p>
                            </div>
                        }
                    >
                        {(record) => (
                            <div class="spotlight-record">
                                <div class="spotlight-record__row">
                                    <span class="panel-detail">Action</span>
                                    <StatusBadge tone={getActionTone(record().action_type)}>{formatActionLabel(record().action_type)}</StatusBadge>
                                </div>
                                <div class="spotlight-record__row">
                                    <span class="panel-detail">Recorded at</span>
                                    <strong>{formatCreatedAt(record().created_at)}</strong>
                                </div>
                                <div class="spotlight-record__row">
                                    <span class="panel-detail">CLT date</span>
                                    <strong>{record().fecha_clt || 'No CLT date available'}</strong>
                                </div>
                                <div class="spotlight-record__row">
                                    <span class="panel-detail">RUT</span>
                                    <strong>{record().rut_masked || 'Hidden'}</strong>
                                </div>
                                <div class="spotlight-record__row">
                                    <span class="panel-detail">Run number</span>
                                    <strong>{record().run_number || 'No run number'}</strong>
                                </div>
                                <div class="spotlight-record__message">
                                    <span class="panel-detail">Message</span>
                                    <p>{record().message || 'No additional detail'}</p>
                                </div>
                            </div>
                        )}
                    </Show>
                </article>
            </section>

            <section class="panel history-panel">
                <div class="panel-header">
                    <div>
                        <span class="panel-label">Chronological history</span>
                        <h2>Clocking feed</h2>
                    </div>
                    <span class="panel-detail">Descending order by created_at</span>
                </div>

                <Show
                    when={!marcajesQuery.isLoading && records().length > 0}
                    fallback={
                        <div class="history-fallback">
                            <Show
                                when={marcajesQuery.isLoading}
                                fallback={<p>No rows available yet. When clocking records exist, they will appear here with their status and details.</p>}
                            >
                                <div class="loading-grid" aria-hidden="true">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </Show>
                        </div>
                    }
                >
                    <HistoryTable items={records()} />
                </Show>
            </section>

            <details class="panel technical-details">
                <summary class="technical-details__summary">
                    <div>
                        <span class="panel-label">Technical details</span>
                        <h2>Endpoint status and telemetry</h2>
                    </div>
                    <span class="technical-details__hint">Expand</span>
                </summary>

                <div class="technical-details__content">
                    <div class="technical-details__grid">
                        <div class="technical-stat">
                            <span class="panel-label">Endpoint</span>
                            <strong>{marcajesQuery.isError ? 'OFFLINE' : 'ONLINE'}</strong>
                            <span class="panel-detail">{marcajesQuery.isError ? 'The service did not return a valid response.' : 'The API responded correctly.'}</span>
                        </div>
                        <div class="technical-stat">
                            <span class="panel-label">Visible records</span>
                            <strong>{String(recordCount())}</strong>
                            <span class="panel-detail">Current response from GET /?limit=100.</span>
                        </div>
                        <div class="technical-stat">
                            <span class="panel-label">Confirmed records</span>
                            <strong>{String(statusSummary().success)}</strong>
                            <span class="panel-detail">{`${statusSummary().error} errors / ${statusSummary().info} informational`}</span>
                        </div>
                    </div>

                    <dl class="system-list">
                        <div>
                            <dt>Source</dt>
                            <dd>Cloud Function + Firestore</dd>
                        </div>
                        <div>
                            <dt>Auto refresh</dt>
                            <dd>Every 60 seconds and on focus</dd>
                        </div>
                        <div>
                            <dt>Requested limit</dt>
                            <dd>100 records</dd>
                        </div>
                    </dl>

                    <Show when={marcajesQuery.isError}>
                        <div class="error-banner">
                            <strong>Read error</strong>
                            <p>{marcajesQuery.error instanceof Error ? marcajesQuery.error.message : 'The endpoint could not be queried.'}</p>
                        </div>
                    </Show>
                </div>
            </details>
        </main>
    )
}

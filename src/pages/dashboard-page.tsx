import { Show } from 'solid-js'
import { useMarcajesStore } from '../features/marcajes/application/marcajes.store'
import { HistoryTable } from '../features/marcajes/ui/history-table'

export function DashboardPage() {
    const marcajesStore = useMarcajesStore()

    const handleRefresh = async () => {
        await marcajesStore.refresh()
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
                        <p class="hero-panel__lead">Working hours: 08:30 AM - 05:30 PM.</p>
                    </div>
                    <div class="hero-panel__actions">
                        <button class="terminal-button" type="button" onClick={handleRefresh} disabled={marcajesStore.isRefetching()}>
                            {marcajesStore.isRefetching() ? 'Refreshing...' : 'Refresh now'}
                        </button>
                    </div>
                </div>
            </section>

            <section class="panel history-panel">
                <div class="panel-header">
                    <div>
                        <h2>Confirmed clocking feed</h2>
                        <p class="panel-detail">Clocking in Buk with a human time buffer.</p>
                    </div>
                </div>

                <Show
                    when={!marcajesStore.isLoading() && marcajesStore.confirmedRecords().length > 0}
                    fallback={
                        <div class="history-fallback">
                            <Show
                                when={marcajesStore.isLoading()}
                                fallback={<p>No confirmed records available yet. When a success status exists, it will appear here.</p>}
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
                    <HistoryTable items={marcajesStore.confirmedRecords()} />
                </Show>
            </section>
        </main>
    )
}

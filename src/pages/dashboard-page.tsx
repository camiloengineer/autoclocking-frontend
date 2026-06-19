import { Show } from 'solid-js'
import { LoadingState } from '../components/ui/loading-state'
import { PanelHeader } from '../components/ui/panel-header'
import { useDashboardPage } from '../features/marcajes/application/use-dashboard-page'
import { HistoryTable } from '../features/marcajes/ui/history-table'

export function DashboardPage() {
    const dashboardPage = useDashboardPage()

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
                        <button class="terminal-button" type="button" onClick={dashboardPage.refresh} disabled={dashboardPage.isRefetching()}>
                            {dashboardPage.isRefetching() ? 'Refreshing...' : 'Refresh now'}
                        </button>
                    </div>
                </div>
            </section>

            <section class="panel history-panel">
                <PanelHeader title="Clocking feed" detail="Random delay of 1 to 20 minutes per RUT before execution" />

                <Show
                    when={!dashboardPage.isLoading() && dashboardPage.hasRecords()}
                    fallback={
                        <div class="history-fallback">
                            <Show when={dashboardPage.isLoading()} fallback={<p>No clocking records available yet. Confirmations and same-direction warnings will appear here.</p>}>
                                <LoadingState withShell={false} />
                            </Show>
                        </div>
                    }
                >
                    <HistoryTable items={dashboardPage.records()} />
                </Show>
            </section>
        </main>
    )
}

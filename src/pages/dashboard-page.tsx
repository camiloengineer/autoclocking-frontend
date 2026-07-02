import { Show } from 'solid-js'
import { CalendarClock, Clock3 } from 'lucide-solid'
import { LoadingState } from '../components/ui/loading-state'
import { PanelHeader } from '../components/ui/panel-header'
import { RefreshButton } from '../components/ui/refresh-button'
import { useDashboardPage } from '../features/marcajes/application/use-dashboard-page'
import { HistoryTable } from '../features/marcajes/ui/history-table'

export function DashboardPage() {
    const dashboardPage = useDashboardPage()

    return (
        <main class="dashboard-shell">
            <section class="hero-panel panel">
                <div class="hero-panel__content">
                    <div class="hero-panel__main">
                        <div class="hero-panel__brand">
                            <img src="/biohazard.svg" alt="" aria-hidden="true" />
                            <div>
                                <span class="hero-panel__eyebrow"><span class="signal-dot" /> Automation console</span>
                                <h1>AutoClocking</h1>
                            </div>
                        </div>
                        <p class="hero-panel__lead">Scheduled clock-ins for the RUTs assigned to your account, with a compact weekly audit trail.</p>
                    </div>
                    <div class="schedule-card">
                        <span class="schedule-card__icon"><CalendarClock size={20} aria-hidden="true" /></span>
                        <div>
                            <span>Configured shift</span>
                            <strong>08:30 AM - 05:30 PM</strong>
                            <small>Monday to Friday</small>
                        </div>
                    </div>
                </div>
            </section>

            <section class="panel history-panel">
                <PanelHeader
                    title="Clocking feed"
                    detail={<span class="panel-detail__content"><Clock3 size={15} aria-hidden="true" /> One consolidated row per RUT, date, and direction from the last 7 days</span>}
                    action={<RefreshButton busy={dashboardPage.isRefetching()} onClick={dashboardPage.refresh} idleLabel="Refresh" busyLabel="Refreshing" />}
                />

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
                    <Show when={dashboardPage.totalPages() > 1}>
                        <div class="history-pager">
                            <span class="history-pager__status">Showing {dashboardPage.rangeStart()}-{dashboardPage.rangeEnd()} of {dashboardPage.totalVisible()}</span>
                            <div class="history-pager__controls">
                                <button
                                    class="history-pager__button"
                                    type="button"
                                    onClick={dashboardPage.prevPage}
                                    disabled={dashboardPage.page() <= 1}
                                >
                                    Previous
                                </button>
                                <span class="history-pager__page">
                                    Page {dashboardPage.page()} of {dashboardPage.totalPages()}
                                </span>
                                <button
                                    class="history-pager__button"
                                    type="button"
                                    onClick={dashboardPage.nextPage}
                                    disabled={dashboardPage.page() >= dashboardPage.totalPages()}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </Show>
                </Show>
            </section>
        </main>
    )
}

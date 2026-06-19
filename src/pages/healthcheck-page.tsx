import { For, Show } from 'solid-js'
import { EmptyState } from '../components/ui/empty-state'
import { LoadingState } from '../components/ui/loading-state'
import { PanelHeader } from '../components/ui/panel-header'
import { RefreshButton } from '../components/ui/refresh-button'
import { useHealthcheckPage } from '../features/healthcheck/application/use-healthcheck-page'
import { getHealthSegmentClass, getUptimeValue } from '../features/healthcheck/domain/healthcheck.utils'

export function HealthcheckPage() {
    const healthcheckPage = useHealthcheckPage()

    return (
        <main class="dashboard-shell">
            <section class="panel history-panel">
                <PanelHeader
                    title="30-day healthcheck"
                    detail="Working days must clock in/out; weekends and holidays must stay at 0/0."
                    action={<RefreshButton busy={healthcheckPage.isFetching()} onClick={healthcheckPage.refreshHealthcheck} />}
                />

                <Show
                    when={!healthcheckPage.isLoading()}
                    fallback={<LoadingState />}
                >
                    <Show
                        when={!healthcheckPage.isError() && healthcheckPage.days().length > 0}
                        fallback={
                            <EmptyState
                                title={healthcheckPage.isError() ? 'Failed to calculate healthcheck' : 'No evaluable working days'}
                                description={
                                    healthcheckPage.isError()
                                        ? 'Clock-ins or holidays API did not return a valid format.'
                                        : 'The current window does not contain past working days.'
                                }
                            />
                        }
                    >
                        <div class="healthcheck-uptime">
                            <div class="healthcheck-uptime__topline">
                                <strong>{getUptimeValue(healthcheckPage.days())}% complete</strong>
                                <span>Last 30 evaluated days</span>
                            </div>
                            <div class="healthcheck-segments" aria-label="Healthcheck por día laboral">
                                <For each={healthcheckPage.days()}>
                                    {(day) => (
                                        <span
                                            class={getHealthSegmentClass(day)}
                                            title={`${day.label} ${day.date}: ${day.message}. Entry: ${day.entrada}. Exit: ${day.salida}.`}
                                            aria-label={`${day.date}: ${day.message}`}
                                        />
                                    )}
                                </For>
                            </div>
                            <div class="healthcheck-uptime__axis">
                                <span>{healthcheckPage.days()[0]?.date ?? 'No data'}</span>
                                <span>Today</span>
                            </div>
                            <div class="healthcheck-legend">
                                <span><i class="healthcheck-segment--ok" /> compliant</span>
                                <span><i class="healthcheck-segment--down" /> incomplete</span>
                                <span><i class="healthcheck-segment--unknown" /> not evaluable</span>
                            </div>
                        </div>
                    </Show>
                </Show>
            </section>
        </main>
    )
}

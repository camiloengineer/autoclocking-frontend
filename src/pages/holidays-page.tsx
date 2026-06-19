import { CalendarDays } from 'lucide-solid'
import { For, Show } from 'solid-js'
import { EmptyState } from '../components/ui/empty-state'
import { LoadingState } from '../components/ui/loading-state'
import { PanelHeader } from '../components/ui/panel-header'
import { RefreshButton } from '../components/ui/refresh-button'
import { useHolidaysPage } from '../features/holidays/application/use-holidays-page'
import { formatHolidayDate } from '../features/holidays/domain/holiday.formatters'

export function HolidaysPage() {
    const holidaysPage = useHolidaysPage()

    return (
        <main class="dashboard-shell">
            <section class="panel history-panel">
                <PanelHeader
                    title="Upcoming holidays"
                    detail="Days where the cronjob should not perform real clock-ins."
                    action={<RefreshButton busy={holidaysPage.isFetching()} onClick={holidaysPage.refreshHolidays} />}
                />

                <Show
                    when={!holidaysPage.isLoading()}
                    fallback={<LoadingState />}
                >
                    <Show
                        when={!holidaysPage.isError() && holidaysPage.upcomingHolidays().length > 0}
                        fallback={
                            <EmptyState
                                icon={<CalendarDays size={30} aria-hidden="true" />}
                                title={holidaysPage.isError() ? 'Failed to load holidays' : 'No remaining holidays configured'}
                                description={holidaysPage.isError() ? 'The holidays API did not return a valid format.' : 'There are no pending holidays for this year.'}
                            />
                        }
                    >
                        <div class="holiday-list">
                            <For each={holidaysPage.upcomingHolidays()}>
                                {(holiday) => (
                                    <article class="holiday-item">
                                        <div class="holiday-item__date">
                                            <span>{formatHolidayDate(holiday.date)}</span>
                                            <strong>{holiday.date}</strong>
                                        </div>
                                        <div class="holiday-item__body">
                                            <h3>{holiday.title}</h3>
                                            <p>{holiday.extra || holiday.type}</p>
                                        </div>
                                        <span class={`status-badge ${holiday.inalienable ? 'status-badge--danger' : 'status-badge--neutral'}`}>
                                            {holiday.inalienable ? 'Non-working' : 'Normal'}
                                        </span>
                                    </article>
                                )}
                            </For>
                        </div>
                    </Show>
                </Show>
            </section>
        </main>
    )
}

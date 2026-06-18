import { createQuery } from '@tanstack/solid-query'
import { CalendarDays, RefreshCw } from 'lucide-solid'
import { For, Show } from 'solid-js'
import { fetchHolidays } from '../features/holidays/infra/holidays.api'

const HOLIDAYS_QUERY_KEY = ['holidays'] as const
const DATE_FORMATTER = new Intl.DateTimeFormat('es-CL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
})

function todayISO() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
}

function formatHolidayDate(date: string) {
    const parsed = new Date(`${date}T12:00:00-04:00`)
    return DATE_FORMATTER.format(parsed)
}

export function HolidaysPage() {
    const holidaysQuery = createQuery(() => ({
        queryKey: HOLIDAYS_QUERY_KEY,
        queryFn: () => fetchHolidays()
    }))

    const upcomingHolidays = () => {
        const today = todayISO()
        return (holidaysQuery.data ?? []).filter((holiday) => holiday.date >= today).sort((left, right) => left.date.localeCompare(right.date))
    }

    const refreshHolidays = async () => {
        await holidaysQuery.refetch()
    }

    return (
        <main class="dashboard-shell">
            <section class="panel history-panel">
                <div class="panel-header">
                    <div>
                        <h2>Próximos feriados</h2>
                        <p class="panel-detail">Días donde el cronjob no debería ejecutar marcajes reales.</p>
                    </div>
                    <button class="terminal-button terminal-button--icon" type="button" onClick={refreshHolidays} disabled={holidaysQuery.isFetching}>
                        <RefreshCw size={16} aria-hidden="true" />
                        <span>{holidaysQuery.isFetching ? 'Refreshing' : 'Refresh'}</span>
                    </button>
                </div>

                <Show
                    when={!holidaysQuery.isLoading}
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
                        when={!holidaysQuery.isError && upcomingHolidays().length > 0}
                        fallback={
                            <div class="empty-state">
                                <CalendarDays size={30} aria-hidden="true" />
                                <h3>{holidaysQuery.isError ? 'No se pudieron cargar feriados' : 'No quedan feriados configurados'}</h3>
                                <p>{holidaysQuery.isError ? 'La API de feriados no respondió con un formato válido.' : 'No hay feriados pendientes para este año.'}</p>
                            </div>
                        }
                    >
                        <div class="holiday-list">
                            <For each={upcomingHolidays()}>
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
                                            {holiday.inalienable ? 'Irrenunciable' : 'Normal'}
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

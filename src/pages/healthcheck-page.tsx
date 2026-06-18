import { createQuery } from '@tanstack/solid-query'
import { RefreshCw } from 'lucide-solid'
import { For, Show } from 'solid-js'
import { fetchHolidays } from '../features/holidays/infra/holidays.api'
import type { MarcajeItem } from '../features/marcajes/domain/marcaje.types'
import { fetchMarcajes } from '../features/marcajes/infra/marcajes.api'

const HEALTHCHECK_QUERY_KEY = ['healthcheck'] as const
const HEALTHCHECK_DAYS = 30
const CL_DATE_FORMATTER = new Intl.DateTimeFormat('es-CL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
})

type HealthStatus = 'ok' | 'error' | 'no-history'

type HealthcheckDay = {
    date: string
    label: string
    status: HealthStatus
    message: string
    entrada: string
    salida: string
    successfulMarks: number
}

function todayISO() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
}

function toISODate(date: Date) {
    return date.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
}

function formatDateLabel(date: string) {
    return CL_DATE_FORMATTER.format(new Date(`${date}T12:00:00-04:00`))
}

function isWeekend(date: string) {
    const day = new Date(`${date}T12:00:00-04:00`).getDay()
    return day === 0 || day === 6
}

function getMarcajeDate(item: MarcajeItem) {
    return item.fecha_clt.slice(0, 10) || item.created_at.slice(0, 10)
}

function getMarcajeTime(item: MarcajeItem) {
    return item.fecha_clt.slice(11, 16) || 'OK'
}

function getLastPastDates(days: number) {
    const dates: string[] = []
    const cursor = new Date(`${todayISO()}T12:00:00-04:00`)

    for (let index = 1; index <= days; index += 1) {
        const date = new Date(cursor)
        date.setDate(cursor.getDate() - index)
        dates.push(toISODate(date))
    }

    return dates.reverse()
}

function buildHealthcheckDays(marcajes: MarcajeItem[], holidayDates: Set<string>): HealthcheckDay[] {
    const marcajeDates = marcajes.map(getMarcajeDate).filter(Boolean)
    const firstMarcajeDate = marcajeDates.length > 0 ? marcajeDates.reduce((first, date) => (date < first ? date : first), marcajeDates[0]) : ''
    const recordsByDate = new Map<string, MarcajeItem[]>()

    for (const item of marcajes) {
        const date = getMarcajeDate(item)
        const records = recordsByDate.get(date) ?? []
        records.push(item)
        recordsByDate.set(date, records)
    }

    return [...getLastPastDates(HEALTHCHECK_DAYS - 1), todayISO()]
        .filter((date) => !isWeekend(date) && !holidayDates.has(date))
        .map((date) => {
            if (!firstMarcajeDate || date < firstMarcajeDate) {
                return {
                    date,
                    label: formatDateLabel(date),
                    status: 'no-history',
                    message: 'Sin historial',
                    entrada: 'Sin dato',
                    salida: 'Sin dato',
                    successfulMarks: 0
                }
            }

            const records = recordsByDate.get(date) ?? []
            const hasError = records.some((item) => item.status === 'error')
            const entrada = records.find((item) => item.action_type === 'ENTRADA' && item.status === 'success')
            const salida = records.find((item) => item.action_type === 'SALIDA' && item.status === 'success')
            const successfulMarks = records.filter((item) => item.status === 'success' && (item.action_type === 'ENTRADA' || item.action_type === 'SALIDA')).length

            if (!hasError && successfulMarks >= 2) {
                return {
                    date,
                    label: formatDateLabel(date),
                    status: 'ok',
                    message: 'Dos marcajes OK',
                    entrada: entrada ? getMarcajeTime(entrada) : 'OK',
                    salida: salida ? getMarcajeTime(salida) : 'OK',
                    successfulMarks
                }
            }

            return {
                date,
                label: formatDateLabel(date),
                status: 'error',
                message: hasError ? 'Con error registrado' : successfulMarks === 1 ? 'Un marcaje registrado' : 'Sin marcajes',
                entrada: entrada ? getMarcajeTime(entrada) : 'Falta',
                salida: salida ? getMarcajeTime(salida) : 'Falta',
                successfulMarks
            }
        })
}

function getHealthSegmentClass(day: HealthcheckDay) {
    if (day.status === 'no-history') {
        return 'healthcheck-segment healthcheck-segment--unknown'
    }

    if (day.successfulMarks >= 2) {
        return 'healthcheck-segment healthcheck-segment--ok'
    }

    if (day.successfulMarks === 1) {
        return 'healthcheck-segment healthcheck-segment--partial'
    }

    return 'healthcheck-segment healthcheck-segment--down'
}

function getUptimeValue(days: HealthcheckDay[]) {
    const measuredDays = days.filter((day) => day.status !== 'no-history')
    if (measuredDays.length === 0) {
        return '0.00'
    }

    const okDays = measuredDays.filter((day) => day.successfulMarks >= 2).length
    return ((okDays / measuredDays.length) * 100).toFixed(2)
}

export function HealthcheckPage() {
    const healthcheckQuery = createQuery(() => ({
        queryKey: HEALTHCHECK_QUERY_KEY,
        queryFn: async () => {
            const [marcajes, holidays] = await Promise.all([fetchMarcajes(500), fetchHolidays()])
            const holidayDates = new Set(holidays.map((holiday) => holiday.date))

            return buildHealthcheckDays(marcajes.items, holidayDates)
        }
    }))

    const refreshHealthcheck = async () => {
        await healthcheckQuery.refetch()
    }

    return (
        <main class="dashboard-shell">
            <section class="panel history-panel">
                <div class="panel-header">
                    <div>
                        <h2>Healthcheck 30 días</h2>
                        <p class="panel-detail">Solo días laborales pasados, sin fines de semana, feriados ni hoy.</p>
                    </div>
                    <button class="terminal-button terminal-button--icon" type="button" onClick={refreshHealthcheck} disabled={healthcheckQuery.isFetching}>
                        <RefreshCw size={16} aria-hidden="true" />
                        <span>{healthcheckQuery.isFetching ? 'Refreshing' : 'Refresh'}</span>
                    </button>
                </div>

                <Show
                    when={!healthcheckQuery.isLoading}
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
                        when={!healthcheckQuery.isError && (healthcheckQuery.data?.length ?? 0) > 0}
                        fallback={
                            <div class="empty-state">
                                <h3>{healthcheckQuery.isError ? 'No se pudo calcular el healthcheck' : 'Sin días laborales evaluables'}</h3>
                                <p>{healthcheckQuery.isError ? 'Marcajes o feriados no respondieron con un formato válido.' : 'La ventana actual no contiene días laborales pasados.'}</p>
                            </div>
                        }
                    >
                        <div class="healthcheck-uptime">
                            <div class="healthcheck-uptime__topline">
                                <strong>{getUptimeValue(healthcheckQuery.data ?? [])}% completos</strong>
                                <span>Últimos 30 días laborales evaluables</span>
                            </div>
                            <div class="healthcheck-segments" aria-label="Healthcheck por día laboral">
                                <For each={healthcheckQuery.data ?? []}>
                                    {(day) => (
                                        <span
                                            class={getHealthSegmentClass(day)}
                                            title={`${day.label} ${day.date}: ${day.message}. Entrada: ${day.entrada}. Salida: ${day.salida}.`}
                                            aria-label={`${day.date}: ${day.message}`}
                                        />
                                    )}
                                </For>
                            </div>
                            <div class="healthcheck-uptime__axis">
                                <span>{healthcheckQuery.data?.[0]?.date ?? 'Sin datos'}</span>
                                <span>Hoy</span>
                            </div>
                            <div class="healthcheck-legend">
                                <span><i class="healthcheck-segment--ok" /> 2 marcajes</span>
                                <span><i class="healthcheck-segment--partial" /> 1 marcaje</span>
                                <span><i class="healthcheck-segment--down" /> 0 marcajes</span>
                                <span><i class="healthcheck-segment--unknown" /> sin historial</span>
                            </div>
                        </div>
                    </Show>
                </Show>
            </section>
        </main>
    )
}

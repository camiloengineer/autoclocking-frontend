import { createQuery } from '@tanstack/solid-query'
import { RefreshCw } from 'lucide-solid'
import { For, Show } from 'solid-js'
import { fetchHolidays } from '../features/holidays/infra/holidays.api'
import type { MarcajeItem } from '../features/marcajes/domain/marcaje.types'
import { fetchMarcajes } from '../features/marcajes/infra/marcajes.api'
import type { RutItem } from '../features/ruts/domain/rut.types'
import { fetchRuts } from '../features/ruts/infra/ruts.api'

const HEALTHCHECK_QUERY_KEY = ['healthcheck'] as const
const HEALTHCHECK_DAYS = 30
const ENTRY_WINDOW_START_MINUTE = 8 * 60 + 10
const ENTRY_DEADLINE_MINUTE = 8 * 60 + 30
const EXIT_WINDOW_START_MINUTE = 17 * 60 + 30
const EXIT_DEADLINE_MINUTE = 17 * 60 + 50
const US_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
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
}

type ExpectedRuts = {
    count: number
    keys: Set<string>
    masked: Set<string>
}

type DayCounts = {
    entrada: number
    salida: number
}

type HealthcheckContext = {
    expectedRuts: ExpectedRuts
    recordsByDate: Map<string, MarcajeItem[]>
    firstMarcajeDate: string
    holidayDates: Set<string>
    today: string
    currentMinute: number
}

function todayISO() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
}

function toISODate(date: Date) {
    return date.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
}

function formatDateLabel(date: string) {
    return US_DATE_FORMATTER.format(new Date(`${date}T12:00:00-04:00`))
}

function isWeekend(date: string) {
    const day = new Date(`${date}T12:00:00-04:00`).getDay()
    return day === 0 || day === 6
}

function getMarcajeDate(item: MarcajeItem) {
    return item.fecha_clt.slice(0, 10) || item.created_at.slice(0, 10)
}

function getChileMinuteOfDay() {
    const parts = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: 'America/Santiago'
    }).formatToParts(new Date())
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)

    return hour * 60 + minute
}

function maskRut(value: string) {
    const normalized = value.trim()
    if (normalized.length <= 4) {
        return '*'.repeat(normalized.length)
    }

    return `${normalized.slice(0, 4)}${'*'.repeat(normalized.length - 4)}`
}

function normalizeRut(value: string) {
    return value.toLowerCase().replace(/[.\-\s]/g, '')
}

async function getRutKey(value: string) {
    const bytes = new TextEncoder().encode(normalizeRut(value))
    const hash = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(hash))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
}

function isConfirmedAction(item: MarcajeItem) {
    return item.status === 'success' || (item.status === 'info' && /^Duplicate clock/i.test(item.message))
}

function isExpectedRutRecord(item: MarcajeItem, expectedRutKeys: Set<string>, expectedMaskedRuts: Set<string>) {
    return item.rut_key ? expectedRutKeys.has(item.rut_key) : expectedMaskedRuts.has(item.rut_masked)
}

function countConfirmedRuts(records: MarcajeItem[], actionType: MarcajeItem['action_type'], expectedRuts: ExpectedRuts) {
    const markedRuts = new Set(
        records
            .filter(
                (item) =>
                    item.action_type === actionType &&
                    isConfirmedAction(item) &&
                    isExpectedRutRecord(item, expectedRuts.keys, expectedRuts.masked)
            )
            .map((item) => item.rut_key || item.rut_masked)
    )

    return markedRuts.size
}

function buildExpectedRuts(activeRuts: RutItem[], expectedRutKeys: Set<string>): ExpectedRuts {
    return {
        count: activeRuts.length,
        keys: expectedRutKeys,
        masked: new Set(activeRuts.map((rut) => maskRut(rut.rut)))
    }
}

function groupRecordsByDate(marcajes: MarcajeItem[]) {
    const recordsByDate = new Map<string, MarcajeItem[]>()

    for (const item of marcajes) {
        const date = getMarcajeDate(item)
        const records = recordsByDate.get(date) ?? []
        records.push(item)
        recordsByDate.set(date, records)
    }

    return recordsByDate
}

function getFirstExpectedMarcajeDate(marcajes: MarcajeItem[], expectedRuts: ExpectedRuts) {
    const dates = marcajes
        .filter((item) => item.action_type !== 'FERIADO' && isExpectedRutRecord(item, expectedRuts.keys, expectedRuts.masked))
        .map(getMarcajeDate)
        .filter(Boolean)

    return dates.length > 0 ? dates.reduce((first, date) => (date < first ? date : first), dates[0]) : ''
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

function createHealthcheckDay(date: string, status: HealthStatus, message: string, counts: DayCounts | null, expectedCount: number): HealthcheckDay {
    return {
        date,
        label: formatDateLabel(date),
        status,
        message,
        entrada: counts ? `${counts.entrada}/${expectedCount}` : 'No data',
        salida: counts ? `${counts.salida}/${expectedCount}` : 'No data'
    }
}

function getDayCounts(records: MarcajeItem[], expectedRuts: ExpectedRuts): DayCounts {
    return {
        entrada: countConfirmedRuts(records, 'ENTRADA', expectedRuts),
        salida: countConfirmedRuts(records, 'SALIDA', expectedRuts)
    }
}

function hasClocking(counts: DayCounts) {
    return counts.entrada > 0 || counts.salida > 0
}

function evaluateHealthcheckDay(date: string, context: HealthcheckContext): HealthcheckDay {
    const { expectedRuts, recordsByDate, firstMarcajeDate, holidayDates, today, currentMinute } = context

    if (expectedRuts.count === 0) {
        return createHealthcheckDay(date, 'no-history', 'No active RUTs', null, expectedRuts.count)
    }

    const counts = getDayCounts(recordsByDate.get(date) ?? [], expectedRuts)
    const nonWorkingDay = isWeekend(date) || holidayDates.has(date)

    if (nonWorkingDay && hasClocking(counts)) {
        return createHealthcheckDay(date, 'error', 'Clocking found on non-working day', counts, expectedRuts.count)
    }

    if (nonWorkingDay) {
        return createHealthcheckDay(date, 'ok', 'No clockings on non-working day', counts, expectedRuts.count)
    }

    if (date !== today && (!firstMarcajeDate || date < firstMarcajeDate)) {
        return createHealthcheckDay(date, 'no-history', 'No history', null, expectedRuts.count)
    }

    if (date === today && currentMinute < ENTRY_WINDOW_START_MINUTE) {
        return createHealthcheckDay(date, 'no-history', "Entry window hasn't started", counts, expectedRuts.count)
    }

    if (date === today && currentMinute < ENTRY_DEADLINE_MINUTE) {
        return createHealthcheckDay(date, 'ok', 'Entry window in progress', counts, expectedRuts.count)
    }

    if (counts.entrada < expectedRuts.count) {
        return createHealthcheckDay(date, 'error', 'Entry incomplete after 08:30', counts, expectedRuts.count)
    }

    if (date === today && currentMinute < EXIT_WINDOW_START_MINUTE) {
        return createHealthcheckDay(date, 'ok', 'Entry complete; exit pending', counts, expectedRuts.count)
    }

    if (date === today && currentMinute < EXIT_DEADLINE_MINUTE) {
        return createHealthcheckDay(date, 'ok', 'Exit window in progress', counts, expectedRuts.count)
    }

    if (counts.salida === expectedRuts.count) {
        return createHealthcheckDay(date, 'ok', 'Entry and exit complete', counts, expectedRuts.count)
    }

    return createHealthcheckDay(date, 'error', 'Exit incomplete after 17:50', counts, expectedRuts.count)
}

function buildHealthcheckDays(marcajes: MarcajeItem[], activeRuts: RutItem[], expectedRutKeys: Set<string>, holidayDates: Set<string>): HealthcheckDay[] {
    const expectedRuts = buildExpectedRuts(activeRuts, expectedRutKeys)
    const context: HealthcheckContext = {
        expectedRuts,
        recordsByDate: groupRecordsByDate(marcajes),
        firstMarcajeDate: getFirstExpectedMarcajeDate(marcajes, expectedRuts),
        holidayDates,
        today: todayISO(),
        currentMinute: getChileMinuteOfDay()
    }

    return [...getLastPastDates(HEALTHCHECK_DAYS - 1), context.today]
        .map((date) => evaluateHealthcheckDay(date, context))
}

function getHealthSegmentClass(day: HealthcheckDay) {
    if (day.status === 'no-history') {
        return 'healthcheck-segment healthcheck-segment--unknown'
    }

    if (day.status === 'ok') {
        return 'healthcheck-segment healthcheck-segment--ok'
    }

    return 'healthcheck-segment healthcheck-segment--down'
}

function getUptimeValue(days: HealthcheckDay[]) {
    const measuredDays = days.filter((day) => day.status !== 'no-history')
    if (measuredDays.length === 0) {
        return '0.00'
    }

    const okDays = measuredDays.filter((day) => day.status === 'ok').length
    return ((okDays / measuredDays.length) * 100).toFixed(2)
}

export function HealthcheckPage() {
    const healthcheckQuery = createQuery(() => ({
        queryKey: HEALTHCHECK_QUERY_KEY,
        queryFn: async () => {
            const [marcajes, holidays, ruts] = await Promise.all([fetchMarcajes(500), fetchHolidays(), fetchRuts()])
            const activeRuts = ruts.items.filter((rut) => rut.active)
            const rutKeys = await Promise.all(activeRuts.map((rut) => getRutKey(rut.rut)))
            const holidayDates = new Set(holidays.map((holiday) => holiday.date))

            return buildHealthcheckDays(marcajes.items, activeRuts, new Set(rutKeys), holidayDates)
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
                        <h2>30-day healthcheck</h2>
                        <p class="panel-detail">Working days must clock in/out; weekends and holidays must stay at 0/0.</p>
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
                                <h3>{healthcheckQuery.isError ? 'Failed to calculate healthcheck' : 'No evaluable working days'}</h3>
                                <p>{healthcheckQuery.isError ? 'Clock-ins or holidays API did not return a valid format.' : 'The current window does not contain past working days.'}</p>
                            </div>
                        }
                    >
                        <div class="healthcheck-uptime">
                            <div class="healthcheck-uptime__topline">
                                <strong>{getUptimeValue(healthcheckQuery.data ?? [])}% complete</strong>
                                <span>Last 30 evaluated days</span>
                            </div>
                            <div class="healthcheck-segments" aria-label="Healthcheck por día laboral">
                                <For each={healthcheckQuery.data ?? []}>
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
                                <span>{healthcheckQuery.data?.[0]?.date ?? 'No data'}</span>
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

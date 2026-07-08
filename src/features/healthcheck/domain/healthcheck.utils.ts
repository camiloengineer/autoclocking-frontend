import type { MarcajeItem } from '../../marcajes/domain/marcaje.types'
import type { RutItem } from '../../ruts/domain/rut.types'
import { maskRut } from '../../ruts/domain/rut.formatters'
import {
    ENTRY_DEADLINE_MINUTE,
    ENTRY_WINDOW_START_MINUTE,
    EXIT_DEADLINE_MINUTE,
    EXIT_WINDOW_START_MINUTE,
    HEALTHCHECK_DAYS
} from './healthcheck.constants'
import type { DayCounts, ExpectedRuts, HealthcheckContext, HealthcheckDay, HealthStatus, RutCreation, TodayDetail } from './healthcheck.types'

const US_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
})

export function todayISO() {
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

function cltMinuteOfDay(instant: Date) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: 'America/Santiago'
    }).formatToParts(instant)
    const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
    const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)

    return hour * 60 + minute
}

function getChileMinuteOfDay() {
    return cltMinuteOfDay(new Date())
}

function isConfirmedAction(item: MarcajeItem) {
    return item.status === 'success' || (item.status === 'info' && /^Duplicate clock/i.test(item.message))
}

function isExpectedRutRecord(item: MarcajeItem, expectedRutKeys: Set<string>, expectedMaskedRuts: Set<string>) {
    return item.rut_key ? expectedRutKeys.has(item.rut_key) : expectedMaskedRuts.has(item.rut_masked)
}

function recordCreation(item: MarcajeItem, expectedRuts: ExpectedRuts): RutCreation | null {
    if (item.rut_key) {
        return expectedRuts.creationByKey.get(item.rut_key) ?? null
    }

    return expectedRuts.creationByMasked.get(item.rut_masked) ?? null
}

function creationQualifies(created: RutCreation, date: string, deadlineMinute: number) {
    if (created.date < date) {
        return true
    }
    if (created.date > date) {
        return false
    }

    return created.minute <= deadlineMinute
}

function qualifiesAsConfirmed(item: MarcajeItem, actionType: MarcajeItem['action_type'], date: string, deadlineMinute: number, expectedRuts: ExpectedRuts) {
    if (item.action_type !== actionType || !isConfirmedAction(item)) {
        return false
    }

    const created = recordCreation(item, expectedRuts)
    if (!created) {
        return false
    }

    return creationQualifies(created, date, deadlineMinute)
}

function countConfirmedRuts(records: MarcajeItem[], actionType: MarcajeItem['action_type'], date: string, deadlineMinute: number, expectedRuts: ExpectedRuts) {
    const markedRuts = new Set<string>()

    for (const item of records) {
        if (qualifiesAsConfirmed(item, actionType, date, deadlineMinute, expectedRuts)) {
            markedRuts.add(item.rut_key || item.rut_masked)
        }
    }

    return markedRuts.size
}

function extractClockTime(item: MarcajeItem) {
    const time = item.fecha_clt.slice(11, 16)
    return /^\d{2}:\d{2}$/.test(time) ? time : ''
}

function collectTodayTimes(records: MarcajeItem[], actionType: MarcajeItem['action_type'], date: string, deadlineMinute: number, expectedRuts: ExpectedRuts): { marked: number; times: string[] } {
    const timeByRut = new Map<string, string>()

    for (const item of records) {
        if (!qualifiesAsConfirmed(item, actionType, date, deadlineMinute, expectedRuts)) {
            continue
        }

        const id = item.rut_key || item.rut_masked
        const time = extractClockTime(item)
        const previous = timeByRut.get(id)
        if (previous === undefined || (time !== '' && (previous === '' || time < previous))) {
            timeByRut.set(id, time)
        }
    }

    const times = [...timeByRut.values()].filter((value) => value !== '').sort()
    return { marked: timeByRut.size, times }
}

function buildExpectedRuts(activeRuts: RutItem[], rutKeys: string[]): ExpectedRuts {
    const creations = activeRuts.map((rut) => toCreation(rut.created_at))
    const creationByKey = new Map<string, RutCreation>()
    const creationByMasked = new Map<string, RutCreation>()

    activeRuts.forEach((rut, index) => {
        const creation = creations[index]
        const key = rutKeys[index]
        if (key) {
            creationByKey.set(key, creation)
        }
        creationByMasked.set(maskRut(rut.rut), creation)
    })

    return {
        count: activeRuts.length,
        keys: new Set(rutKeys),
        masked: new Set(activeRuts.map((rut) => maskRut(rut.rut))),
        creations,
        creationByKey,
        creationByMasked
    }
}

function toCreation(createdAt: string): RutCreation {
    const instant = new Date(createdAt)
    if (Number.isNaN(instant.getTime())) {
        return { date: '', minute: 0 }
    }

    return { date: toISODate(instant), minute: cltMinuteOfDay(instant) }
}

function expectedCountForShift(expectedRuts: ExpectedRuts, date: string, deadlineMinute: number) {
    return expectedRuts.creations.filter((created) => creationQualifies(created, date, deadlineMinute)).length
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

function createHealthcheckDay(date: string, status: HealthStatus, message: string, counts: DayCounts | null, expected: DayCounts): HealthcheckDay {
    return {
        date,
        label: formatDateLabel(date),
        status,
        message,
        entrada: counts ? `${counts.entrada}/${expected.entrada}` : 'No data',
        salida: counts ? `${counts.salida}/${expected.salida}` : 'No data'
    }
}

function getDayCounts(records: MarcajeItem[], expectedRuts: ExpectedRuts, date: string): DayCounts {
    return {
        entrada: countConfirmedRuts(records, 'ENTRADA', date, ENTRY_DEADLINE_MINUTE, expectedRuts),
        salida: countConfirmedRuts(records, 'SALIDA', date, EXIT_DEADLINE_MINUTE, expectedRuts)
    }
}

function hasClocking(counts: DayCounts) {
    return counts.entrada > 0 || counts.salida > 0
}

type PhaseVerdict = 'ok' | 'pending' | 'fail'

function phaseVerdict(marked: number, expected: number, isToday: boolean, currentMinute: number, deadlineMinute: number): PhaseVerdict {
    if (marked >= expected) {
        return 'ok'
    }

    if (isToday && currentMinute < deadlineMinute) {
        return 'pending'
    }

    return 'fail'
}

function evaluateHealthcheckDay(date: string, context: HealthcheckContext): HealthcheckDay {
    const { expectedRuts, recordsByDate, firstMarcajeDate, holidayDates, today, currentMinute } = context

    if (expectedRuts.count === 0) {
        return createHealthcheckDay(date, 'no-history', 'No active RUTs', null, { entrada: 0, salida: 0 })
    }

    const expected: DayCounts = {
        entrada: expectedCountForShift(expectedRuts, date, ENTRY_DEADLINE_MINUTE),
        salida: expectedCountForShift(expectedRuts, date, EXIT_DEADLINE_MINUTE)
    }
    const counts = getDayCounts(recordsByDate.get(date) ?? [], expectedRuts, date)
    const nonWorkingDay = isWeekend(date) || holidayDates.has(date)

    if (nonWorkingDay && hasClocking(counts)) {
        return createHealthcheckDay(date, 'error', 'Clocking found on non-working day', counts, expected)
    }

    if (nonWorkingDay) {
        return createHealthcheckDay(date, 'ok', 'No clockings on non-working day', counts, expected)
    }

    if (date !== today && (!firstMarcajeDate || date < firstMarcajeDate)) {
        return createHealthcheckDay(date, 'no-history', 'No history', null, expected)
    }

    if (expected.salida === 0) {
        return createHealthcheckDay(date, 'no-history', 'No history', null, expected)
    }

    const isToday = date === today
    const entry = phaseVerdict(counts.entrada, expected.entrada, isToday, currentMinute, ENTRY_DEADLINE_MINUTE)
    const exit = phaseVerdict(counts.salida, expected.salida, isToday, currentMinute, EXIT_DEADLINE_MINUTE)

    if (entry === 'fail') {
        return createHealthcheckDay(date, 'error', 'Entry incomplete after 08:30', counts, expected)
    }

    if (exit === 'fail') {
        return createHealthcheckDay(date, 'error', 'Exit incomplete after 17:50', counts, expected)
    }

    if (entry === 'pending') {
        const message = currentMinute < ENTRY_WINDOW_START_MINUTE ? "Entry window hasn't started" : 'Entry window in progress'
        return createHealthcheckDay(date, 'no-history', message, counts, expected)
    }

    if (exit === 'pending') {
        const message = currentMinute < EXIT_WINDOW_START_MINUTE ? 'Entry complete; exit pending' : 'Exit window in progress'
        return createHealthcheckDay(date, 'no-history', message, counts, expected)
    }

    return createHealthcheckDay(date, 'ok', 'Entry and exit complete', counts, expected)
}

function buildTodayDetail(context: HealthcheckContext, todayDay: HealthcheckDay): TodayDetail {
    const { expectedRuts, recordsByDate, holidayDates, today } = context
    const records = recordsByDate.get(today) ?? []
    const working = !(isWeekend(today) || holidayDates.has(today))
    const entrada = collectTodayTimes(records, 'ENTRADA', today, ENTRY_DEADLINE_MINUTE, expectedRuts)
    const salida = collectTodayTimes(records, 'SALIDA', today, EXIT_DEADLINE_MINUTE, expectedRuts)

    return {
        date: today,
        label: todayDay.label,
        status: todayDay.status,
        message: todayDay.message,
        working,
        entrada: { marked: entrada.marked, expected: expectedCountForShift(expectedRuts, today, ENTRY_DEADLINE_MINUTE), times: entrada.times },
        salida: { marked: salida.marked, expected: expectedCountForShift(expectedRuts, today, EXIT_DEADLINE_MINUTE), times: salida.times }
    }
}

export function buildHealthcheckDays(marcajes: MarcajeItem[], activeRuts: RutItem[], rutKeys: string[], holidayDates: Set<string>): { days: HealthcheckDay[]; today: TodayDetail } {
    const expectedRuts = buildExpectedRuts(activeRuts, rutKeys)
    const context: HealthcheckContext = {
        expectedRuts,
        recordsByDate: groupRecordsByDate(marcajes),
        firstMarcajeDate: getFirstExpectedMarcajeDate(marcajes, expectedRuts),
        holidayDates,
        today: todayISO(),
        currentMinute: getChileMinuteOfDay()
    }

    const pastDays = getLastPastDates(HEALTHCHECK_DAYS - 1).map((date) => evaluateHealthcheckDay(date, context))
    const todayDay = evaluateHealthcheckDay(context.today, context)

    return { days: [...pastDays, todayDay], today: buildTodayDetail(context, todayDay) }
}

export function getHealthSegmentClass(day: HealthcheckDay) {
    if (day.status === 'no-history') {
        return 'healthcheck-segment healthcheck-segment--unknown'
    }

    if (day.status === 'ok') {
        return 'healthcheck-segment healthcheck-segment--ok'
    }

    return 'healthcheck-segment healthcheck-segment--down'
}

export function getUptimeValue(days: HealthcheckDay[]) {
    const measuredDays = days.filter((day) => day.status !== 'no-history')
    if (measuredDays.length === 0) {
        return '0.00'
    }

    const okDays = measuredDays.filter((day) => day.status === 'ok').length
    return ((okDays / measuredDays.length) * 100).toFixed(2)
}

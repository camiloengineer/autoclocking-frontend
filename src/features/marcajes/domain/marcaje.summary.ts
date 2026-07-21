import type { MarcajeItem } from './marcaje.types'

const DUPLICATE_MESSAGE_PATTERN = /^Duplicate clock/i

/**
 * A marcaje counts as a confirmed clocking when it succeeded outright or when a
 * duplicate was prevented (proof the RUT was already clocked in for that direction).
 * Mirrors the healthcheck confirmation rule so the feed and healthcheck never disagree.
 */
function isConfirmedMarcaje(item: MarcajeItem): boolean {
    return item.status === 'success' || (item.status === 'info' && DUPLICATE_MESSAGE_PATTERN.test(item.message))
}

function getMarcajeDate(item: MarcajeItem): string {
    return (item.fecha_clt || item.created_at).slice(0, 10)
}

/**
 * Projects raw marcajes into one row per RUT, day and direction, keeping the net
 * outcome: confirmed when the RUT ended up clocked in, failed only when every attempt
 * failed. Holidays are shown once per day and pure debug rows are dropped.
 */
export function summarizeMarcajes(items: MarcajeItem[]): MarcajeItem[] {
    const groups = new Map<string, MarcajeItem[]>()
    const holidays: MarcajeItem[] = []
    const seenHolidayDates = new Set<string>()

    for (const item of items) {
        if (item.action_type === 'FERIADO') {
            const date = getMarcajeDate(item)
            if (!seenHolidayDates.has(date)) {
                seenHolidayDates.add(date)
                holidays.push(item)
            }
            continue
        }

        const identity = item.email_masked
        const key = `${item.action_type}|${getMarcajeDate(item)}|${identity}`
        const bucket = groups.get(key) ?? []
        bucket.push(item)
        groups.set(key, bucket)
    }

    const rows: MarcajeItem[] = [...holidays]

    for (const bucket of groups.values()) {
        const confirmed = bucket.find((item) => item.status === 'success') ?? bucket.find(isConfirmedMarcaje)
        if (confirmed) {
            rows.push(confirmed.status === 'success' ? confirmed : { ...confirmed, status: 'success' })
            continue
        }

        const failed = bucket.find((item) => item.status === 'error')
        if (failed) {
            rows.push(failed)
        }
    }

    return rows.sort((first, second) => second.created_at.localeCompare(first.created_at))
}

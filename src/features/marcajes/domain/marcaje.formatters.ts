import type { MarcajeActionType, MarcajeItem, MarcajeStatus } from './marcaje.types'
import { MARCAJES_ACTION_LABELS, MARCAJES_ACTION_TONES, MARCAJES_STATUS_LABELS, MARCAJES_STATUS_TONES } from './marcaje.constants'

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Santiago'
})

export function formatCreatedAt(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'No timestamp'
    }

    return dateTimeFormatter.format(date)
}

export function formatActionLabel(action: MarcajeActionType) {
    return MARCAJES_ACTION_LABELS[action]
}

export function formatStatusLabel(status: MarcajeStatus) {
    return MARCAJES_STATUS_LABELS[status]
}

export function getStatusTone(status: MarcajeStatus) {
    return MARCAJES_STATUS_TONES[status]
}

export function getActionTone(action: MarcajeActionType) {
    return MARCAJES_ACTION_TONES[action]
}

export function formatMessage(value: string, rutMasked?: string) {
    const normalized = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = normalized
        .split('\n')
        .map((line) => line.trim())
        .filter((line, index, allLines) => {
            if (line !== '') {
                return true
            }

            const previousLine = allLines[index - 1]
            return previousLine !== ''
        })

    const compact = lines.join('\n').trim()

    if (!rutMasked) {
        return compact
    }

    return compact.replace(/\b\d{7,8}[0-9kK]\b/g, rutMasked)
}

export function formatMessageSummary(value: string, rutMasked?: string) {
    const summary = formatMessage(value, rutMasked)
        .split('\n')
        .map((line) => line.trim())
        .find((line) => line.length > 0) || 'No additional detail'

    const successfulAtMatch = summary.match(/^\s*✅\s*(?:SALIDA|ENTRADA)\s+successful at\s+([0-9]{2}:[0-9]{2}:[0-9]{2})(?:\s*\(([^)]+)\))?/i)

    if (successfulAtMatch) {
        const [, clockTime, timezone] = successfulAtMatch
        return `✅ Successful at ${clockTime}${timezone ? ` (${timezone})` : ''}`
    }

    return summary
        .replace(/^✅\s+(?:SALIDA|ENTRADA)\b/i, '✅')
        .trim()
}

export function hasDetails(value: string) {
    return value.trim().length > 0
}

export function filterConfirmedRecords(items: MarcajeItem[]) {
    return items.filter((item) => item.status === 'success')
}

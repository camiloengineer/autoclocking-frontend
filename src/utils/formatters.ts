import type { MarcajeActionType, MarcajeItem, MarcajeStatus } from '../services/marcajes.api'

const dateTimeFormatter = new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Santiago'
})

const timeFormatter = new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Santiago'
})

export function formatCreatedAt(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'Sin timestamp'
    }

    return dateTimeFormatter.format(date)
}

export function formatRefreshTime(value: Date) {
    return timeFormatter.format(value)
}

export function formatActionLabel(action: MarcajeActionType) {
    if (action === 'ENTRADA') {
        return 'Entrada'
    }

    if (action === 'SALIDA') {
        return 'Salida'
    }

    return 'Feriado'
}

export function formatStatusLabel(status: MarcajeStatus) {
    if (status === 'success') {
        return 'Confirmado'
    }

    if (status === 'error') {
        return 'Falló'
    }

    return 'Informativo'
}

export function getStatusTone(status: MarcajeStatus) {
    if (status === 'success') {
        return 'success'
    }

    if (status === 'error') {
        return 'danger'
    }

    return 'neutral'
}

export function getActionTone(action: MarcajeActionType) {
    if (action === 'ENTRADA') {
        return 'success'
    }

    if (action === 'SALIDA') {
        return 'accent'
    }

    return 'neutral'
}

export function getLatestRecord(items: MarcajeItem[]) {
    return items[0] ?? null
}

export function summarizeStatuses(items: MarcajeItem[]) {
    return items.reduce(
        (summary, item) => {
            if (item.status === 'success') {
                summary.success += 1
            } else if (item.status === 'error') {
                summary.error += 1
            } else {
                summary.info += 1
            }

            return summary
        },
        { success: 0, error: 0, info: 0 }
    )
}

import type { MarcajeActionType, MarcajeStatus } from './marcaje.types'

export const MARCAJES_QUERY_KEY = ['marcajes'] as const
export const MARCAJES_DEFAULT_LIMIT = 100
export const MARCAJES_REFRESH_INTERVAL_MS = 60_000
export const MARCAJES_DEFAULT_API_URL = 'https://marcajes-vg7vvkcauq-ue.a.run.app'
export const MARCAJES_CONFIRMED_STATUS: MarcajeStatus = 'success'

export const MARCAJES_ACTION_LABELS: Record<MarcajeActionType, string> = {
    ENTRADA: 'Clock in',
    SALIDA: 'Clock out',
    FERIADO: 'Holiday'
}

export const MARCAJES_STATUS_LABELS: Record<MarcajeStatus, string> = {
    success: 'Confirmed',
    error: 'Failed',
    info: 'Informational'
}

export const MARCAJES_ACTION_TONES: Record<MarcajeActionType, 'success' | 'danger' | 'neutral' | 'accent'> = {
    ENTRADA: 'success',
    SALIDA: 'accent',
    FERIADO: 'neutral'
}

export const MARCAJES_STATUS_TONES: Record<MarcajeStatus, 'success' | 'danger' | 'neutral' | 'accent'> = {
    success: 'success',
    error: 'danger',
    info: 'neutral'
}

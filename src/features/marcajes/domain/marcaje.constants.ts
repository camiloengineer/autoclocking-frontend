import type { MarcajeActionType, MarcajeStatus } from './marcaje.types'

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

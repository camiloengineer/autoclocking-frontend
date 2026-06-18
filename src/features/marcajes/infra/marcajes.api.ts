import { MARCAJES_DEFAULT_LIMIT } from '../application/marcajes.constants'
import type { MarcajeActionType, MarcajesResponse, MarcajeStatus } from '../domain/marcaje.types'
import { MARCAJES_DEFAULT_API_URL } from './marcajes.config'

function getApiUrl() {
    return import.meta.env.VITE_MARCAJES_API_URL || MARCAJES_DEFAULT_API_URL
}

export async function fetchMarcajes(limit = MARCAJES_DEFAULT_LIMIT): Promise<MarcajesResponse> {
    const requestUrl = new URL(getApiUrl())
    requestUrl.searchParams.set('limit', String(limit))

    const response = await fetch(requestUrl.toString(), {
        headers: {
            Accept: 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error(`Endpoint unavailable (${response.status})`)
    }

    const payload = (await response.json()) as Partial<MarcajesResponse>

    if (!Array.isArray(payload.items) || typeof payload.count !== 'number') {
        throw new Error('Invalid API response')
    }

    return {
        count: payload.count,
        items: payload.items.map((item) => ({
            id: String(item.id ?? ''),
            action_type: item.action_type as MarcajeActionType,
            status: item.status as MarcajeStatus,
            message: String(item.message ?? ''),
            details: String(item.details ?? ''),
            rut_masked: String(item.rut_masked ?? ''),
            run_number: String(item.run_number ?? ''),
            fecha_clt: String(item.fecha_clt ?? ''),
            created_at: String(item.created_at ?? '')
        }))
    }
}

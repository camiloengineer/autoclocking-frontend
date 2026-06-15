export type MarcajeActionType = 'ENTRADA' | 'SALIDA' | 'FERIADO'
export type MarcajeStatus = 'success' | 'error' | 'info'

export type MarcajeItem = {
    id: string
    action_type: MarcajeActionType
    status: MarcajeStatus
    message: string
    rut_masked: string
    run_number: string
    fecha_clt: string
    created_at: string
}

export type MarcajesResponse = {
    count: number
    items: MarcajeItem[]
}

const DEFAULT_API_URL = 'https://marcajes-vg7vvkcauq-ue.a.run.app'
const DEFAULT_LIMIT = 100

function getApiUrl() {
    return import.meta.env.VITE_MARCAJES_API_URL || DEFAULT_API_URL
}

export async function fetchMarcajes(limit = DEFAULT_LIMIT): Promise<MarcajesResponse> {
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
            rut_masked: String(item.rut_masked ?? ''),
            run_number: String(item.run_number ?? ''),
            fecha_clt: String(item.fecha_clt ?? ''),
            created_at: String(item.created_at ?? '')
        }))
    }
}

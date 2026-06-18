import type { RutsResponse, RutItem } from '../domain/rut.types'

const RUTS_DEFAULT_API_URL = 'https://autoclocking-ruts-vg7vvkcauq-ue.a.run.app/ruts'

function getRutsApiUrl() {
    if (import.meta.env.VITE_RUTS_API_URL) {
        return import.meta.env.VITE_RUTS_API_URL
    }

    return RUTS_DEFAULT_API_URL
}

function normalizeItem(item: Partial<RutItem>): RutItem {
    return {
        rut: String(item.rut ?? ''),
        active: Boolean(item.active),
        created_at: String(item.created_at ?? ''),
        updated_at: String(item.updated_at ?? '')
    }
}

async function readJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`Endpoint unavailable (${response.status})`)
    }

    return (await response.json()) as T
}

export async function fetchRuts(): Promise<RutsResponse> {
    const payload = await readJsonResponse<Partial<RutsResponse>>(
        await fetch(getRutsApiUrl(), {
            headers: {
                Accept: 'application/json'
            }
        })
    )

    if (!Array.isArray(payload.items) || typeof payload.count !== 'number') {
        throw new Error('Invalid API response')
    }

    return {
        count: payload.count,
        items: payload.items.map(normalizeItem)
    }
}

export async function saveRut(rut: string, active: boolean): Promise<RutItem> {
    return normalizeItem(
        await readJsonResponse<Partial<RutItem>>(
            await fetch(getRutsApiUrl(), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rut, active })
            })
        )
    )
}

export async function updateRutActive(rut: string, active: boolean): Promise<RutItem> {
    return normalizeItem(
        await readJsonResponse<Partial<RutItem>>(
            await fetch(`${getRutsApiUrl()}/${encodeURIComponent(rut)}`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ active })
            })
        )
    )
}

export async function deleteRut(rut: string): Promise<void> {
    await readJsonResponse<{ status: string }>(
        await fetch(`${getRutsApiUrl()}/${encodeURIComponent(rut)}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json'
            }
        })
    )
}

const UPDATED_AT_FORMATTER = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Santiago'
})

export function maskRut(value: string) {
    const normalized = value.trim()
    if (normalized.length <= 4) {
        return '*'.repeat(normalized.length)
    }

    return `${normalized.slice(0, 4)}${'*'.repeat(normalized.length - 4)}`
}

function normalizeRut(value: string) {
    return value.toLowerCase().replace(/[.\-\s]/g, '')
}

/** Derives the SHA-256 hex digest used by the backend to key a RUT without exposing it. */
export async function getRutKey(value: string) {
    const bytes = new TextEncoder().encode(normalizeRut(value))
    const hash = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(hash))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
}

export function formatUpdatedAt(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'No timestamp'
    }

    return UPDATED_AT_FORMATTER.format(date)
}

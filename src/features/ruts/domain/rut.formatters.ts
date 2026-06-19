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

export function formatUpdatedAt(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'No timestamp'
    }

    return UPDATED_AT_FORMATTER.format(date)
}

const UPDATED_AT_FORMATTER = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Santiago'
})

/** Mirrors the backend accounts.Mask so masked emails on marcaje records match accounts. */
export function maskEmail(email: string) {
    const at = email.lastIndexOf('@')
    if (at <= 0) {
        return '***'
    }

    const local = email.slice(0, at)
    const domain = email.slice(at)
    if (local.length <= 2) {
        return `${local.slice(0, 1)}***${domain}`
    }

    return `${local.slice(0, 2)}***${domain}`
}

export function formatUpdatedAt(value: string) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'No timestamp'
    }

    return UPDATED_AT_FORMATTER.format(date)
}

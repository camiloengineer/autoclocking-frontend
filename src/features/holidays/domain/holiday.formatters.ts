const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short'
})

export function todayISO() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
}

export function formatHolidayDate(date: string) {
    const parsed = new Date(`${date}T12:00:00-04:00`)
    return DATE_FORMATTER.format(parsed)
}

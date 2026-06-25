export type HealthStatus = 'ok' | 'error' | 'no-history'

export type HealthcheckDay = {
    date: string
    label: string
    status: HealthStatus
    message: string
    entrada: string
    salida: string
}

export type ExpectedRuts = {
    count: number
    keys: Set<string>
    masked: Set<string>
    creationDates: string[]
}

export type DayCounts = {
    entrada: number
    salida: number
}

export type HealthcheckContext = {
    expectedRuts: ExpectedRuts
    recordsByDate: Map<string, import('../../marcajes/domain/marcaje.types').MarcajeItem[]>
    firstMarcajeDate: string
    holidayDates: Set<string>
    today: string
    currentMinute: number
}

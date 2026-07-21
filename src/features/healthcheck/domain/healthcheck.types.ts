export type HealthStatus = 'ok' | 'error' | 'no-history'

export type HealthcheckDay = {
    date: string
    label: string
    status: HealthStatus
    message: string
    entrada: string
    salida: string
}

export type RutCreation = {
    date: string
    minute: number
}

export type ExpectedRuts = {
    count: number
    masked: Set<string>
    creations: RutCreation[]
    creationByMasked: Map<string, RutCreation>
}

export type DayCounts = {
    entrada: number
    salida: number
}

export type TodayLine = {
    marked: number
    expected: number
    times: string[]
}

export type TodayDetail = {
    date: string
    label: string
    status: HealthStatus
    message: string
    working: boolean
    entrada: TodayLine
    salida: TodayLine
}

export type HealthcheckContext = {
    expectedRuts: ExpectedRuts
    recordsByDate: Map<string, import('../../marcajes/domain/marcaje.types').MarcajeItem[]>
    firstMarcajeDate: string
    holidayDates: Set<string>
    today: string
    currentMinute: number
}

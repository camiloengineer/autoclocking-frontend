export type RutItem = {
    rut: string
    active: boolean
    created_at: string
    updated_at: string
}

export type RutsResponse = {
    count: number
    items: RutItem[]
}

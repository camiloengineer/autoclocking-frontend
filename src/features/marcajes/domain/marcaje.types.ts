export type MarcajeActionType = 'ENTRADA' | 'SALIDA' | 'FERIADO'
export type MarcajeStatus = 'success' | 'error' | 'info'

export type MarcajeItem = {
    id: string
    action_type: MarcajeActionType
    status: MarcajeStatus
    message: string
    details: string
    email_masked: string
    run_number: string
    fecha_clt: string
    created_at: string
}

export type MarcajesResponse = {
    count: number
    items: MarcajeItem[]
}

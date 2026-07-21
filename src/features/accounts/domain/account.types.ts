export type AccountItem = {
    email: string
    job_id: string
    active: boolean
    created_at: string
    updated_at: string
}

export type AccountsResponse = {
    count: number
    items: AccountItem[]
}

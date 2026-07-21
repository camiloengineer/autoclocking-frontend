import type { AccountItem, AccountsResponse } from '../domain/account.types'

const ACCOUNTS_DEFAULT_API_URL = 'https://marcajes-vg7vvkcauq-ue.a.run.app/accounts'

const ERROR_BY_CODE: Record<string, string> = {
    invalid_credentials: 'Buk rejected the email or password',
    account_locked: 'Account locked by Buk — check the unlock email',
    buk_unreachable: 'Could not validate against Buk, try again'
}

function getAccountsApiUrl() {
    return import.meta.env.VITE_ACCOUNTS_API_URL || ACCOUNTS_DEFAULT_API_URL
}

function normalizeItem(item: Partial<AccountItem>): AccountItem {
    return {
        email: String(item.email ?? ''),
        job_id: String(item.job_id ?? ''),
        active: Boolean(item.active),
        created_at: String(item.created_at ?? ''),
        updated_at: String(item.updated_at ?? '')
    }
}

async function readError(response: Response): Promise<string> {
    try {
        const payload = (await response.json()) as { error?: string; code?: string }
        if (payload.code && ERROR_BY_CODE[payload.code]) {
            return ERROR_BY_CODE[payload.code]
        }
        if (payload.error) {
            return payload.error
        }
    } catch {
        // Falls through to the generic status message below.
    }

    return `Endpoint unavailable (${response.status})`
}

async function readJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(await readError(response))
    }

    return (await response.json()) as T
}

export async function fetchAccounts(): Promise<AccountsResponse> {
    const payload = await readJsonResponse<Partial<AccountsResponse>>(
        await fetch(getAccountsApiUrl(), {
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

export async function createAccount(email: string, password: string, active: boolean): Promise<AccountItem> {
    return normalizeItem(
        await readJsonResponse<Partial<AccountItem>>(
            await fetch(getAccountsApiUrl(), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, active })
            })
        )
    )
}

export async function updateAccountActive(email: string, active: boolean): Promise<AccountItem> {
    return normalizeItem(
        await readJsonResponse<Partial<AccountItem>>(
            await fetch(`${getAccountsApiUrl()}/${encodeURIComponent(email)}`, {
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

export async function deleteAccount(email: string): Promise<void> {
    await readJsonResponse<{ status: string }>(
        await fetch(`${getAccountsApiUrl()}/${encodeURIComponent(email)}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json'
            }
        })
    )
}

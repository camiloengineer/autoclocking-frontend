import type { AppSession } from '../domain/session.types'

const AUTH_DEFAULT_API_URL = 'https://marcajes-vg7vvkcauq-ue.a.run.app/auth/session'

export type AuthErrorCode = 'invalid_credentials' | 'account_locked' | 'buk_unreachable' | 'throttled' | 'unknown'

type AuthErrorPayload = {
    error?: string
    code?: string
    attempts_left?: number
    retry_after_seconds?: number
}

export class AuthError extends Error {
    code: AuthErrorCode
    attemptsLeft: number | null
    retryAfterSeconds: number | null

    constructor(code: AuthErrorCode, message: string, attemptsLeft: number | null, retryAfterSeconds: number | null) {
        super(message)
        this.code = code
        this.attemptsLeft = attemptsLeft
        this.retryAfterSeconds = retryAfterSeconds
    }
}

function getAuthApiUrl() {
    return import.meta.env.VITE_AUTH_API_URL || AUTH_DEFAULT_API_URL
}

function toAuthErrorCode(code: unknown): AuthErrorCode {
    if (code === 'invalid_credentials' || code === 'account_locked' || code === 'buk_unreachable' || code === 'throttled') {
        return code
    }
    return 'unknown'
}

/** POSTs the Buk credentials to /auth/session; a valid login IS the account registration. */
export async function createBukSession(email: string, password: string): Promise<AppSession> {
    const response = await fetch(getAuthApiUrl(), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })

    const payload = (await response.json().catch(() => ({}))) as AuthErrorPayload & { email?: string; job_id?: string; is_admin?: boolean }

    if (!response.ok) {
        throw new AuthError(
            toAuthErrorCode(payload.code),
            payload.error || `Endpoint unavailable (${response.status})`,
            typeof payload.attempts_left === 'number' ? payload.attempts_left : null,
            typeof payload.retry_after_seconds === 'number' ? payload.retry_after_seconds : null
        )
    }

    return {
        email: String(payload.email ?? email),
        jobId: String(payload.job_id ?? ''),
        isAdmin: Boolean(payload.is_admin)
    }
}

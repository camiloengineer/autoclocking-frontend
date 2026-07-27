import { createSignal } from 'solid-js'
import { pushToast } from '../../../app/application/toast-store'
import { createBukSession } from '../infra/auth.api'
import type { AppSession } from '../domain/session.types'

const SESSION_STORAGE_KEY = 'autoclocking.session'

function readStoredSession(): AppSession | null {
    try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY)
        if (!raw) {
            return null
        }
        const parsed = JSON.parse(raw) as Partial<AppSession>
        if (typeof parsed.email !== 'string' || !parsed.email) {
            return null
        }
        return {
            email: parsed.email,
            jobId: String(parsed.jobId ?? ''),
            isAdmin: Boolean(parsed.isAdmin)
        }
    } catch {
        return null
    }
}

const [session, setSession] = createSignal<AppSession | null>(readStoredSession())

/** Validates the Buk credentials against the API and persists the resulting session. Throws AuthError for the form to render inline. */
export async function signInWithBuk(email: string, password: string): Promise<void> {
    const nextSession = await createBukSession(email, password)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
    pushToast('success', 'Signed in')
}

export function handleSignOut() {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setSession(null)
    pushToast('success', 'Signed out')
}

export { session }

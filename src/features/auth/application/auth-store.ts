import { createSignal } from 'solid-js'
import { pushToast } from '../../../app/application/toast-store'
import { checkIsAdmin, signInWithGoogle, signOutFromGoogle, subscribeToAuthState } from '../infra/auth.api'
import type { AppSession, AuthStatus } from '../domain/session.types'

const [session, setSession] = createSignal<AppSession | null>(null)
const [status, setStatus] = createSignal<AuthStatus>('loading')

subscribeToAuthState(async (user) => {
    if (!user?.email) {
        setSession(null)
        setStatus('signed-out')
        return
    }

    const email = user.email.toLowerCase()
    let isAdmin = false

    try {
        isAdmin = await checkIsAdmin(email)
    } catch (roleError) {
        pushToast('error', roleError instanceof Error ? roleError.message : 'No se pudo verificar el rol')
    }

    setSession({ email, displayName: user.displayName ?? email, isAdmin })
    setStatus('signed-in')
})

export async function handleSignIn() {
    try {
        await signInWithGoogle()
    } catch (signInError) {
        pushToast('error', signInError instanceof Error ? signInError.message : 'No se pudo iniciar sesión')
    }
}

export async function handleSignOut() {
    try {
        await signOutFromGoogle()
        pushToast('success', 'Sesión cerrada')
    } catch (signOutError) {
        pushToast('error', signOutError instanceof Error ? signOutError.message : 'No se pudo cerrar sesión')
    }
}

export { session, status }

import { createSignal } from 'solid-js'
import { pushToast } from '../../../app/application/toast-store'
import { isRutAccessGranted } from '../domain/rut-access'

/** Gate state for the RUT maintainer: holds the unlock status and email challenge. */
export function useRutsAccess() {
    const [unlocked, setUnlocked] = createSignal(false)
    const [email, setEmail] = createSignal('')

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault()
        if (isRutAccessGranted(email())) {
            setUnlocked(true)
            pushToast('success', 'Acceso concedido al mantenedor de RUTs')
            return
        }
        pushToast('error', 'Acceso denegado: este correo no tiene permisos')
    }

    return {
        unlocked,
        email,
        setEmail,
        handleSubmit
    }
}

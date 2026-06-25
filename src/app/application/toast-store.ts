import { createSignal } from 'solid-js'

export type ToastTone = 'success' | 'error'

export type Toast = {
    id: number
    tone: ToastTone
    message: string
}

const TOAST_DURATION_MS: Record<ToastTone, number> = {
    success: 3200,
    error: 6000
}

const [toasts, setToasts] = createSignal<Toast[]>([])
let nextId = 0

export function dismissToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
}

export function pushToast(tone: ToastTone, message: string) {
    const id = nextId
    nextId += 1
    setToasts((current) => [...current, { id, tone, message }])
    setTimeout(() => dismissToast(id), TOAST_DURATION_MS[tone])
}

export { toasts }

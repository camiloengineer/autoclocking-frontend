import { For } from 'solid-js'
import { X } from 'lucide-solid'
import { dismissToast, toasts } from '../../app/application/toast-store'

export function ToastHost() {
    return (
        <div class="toast-host" aria-live="polite">
            <For each={toasts()}>
                {(toast) => (
                    <div class={`toast toast--${toast.tone}`}>
                        <span class="toast__message">{toast.message}</span>
                        <button class="toast__close" type="button" aria-label="Dismiss" onClick={() => dismissToast(toast.id)}>
                            <X size={14} aria-hidden="true" />
                        </button>
                    </div>
                )}
            </For>
        </div>
    )
}

import { LogIn, Lock } from 'lucide-solid'

type AccessGateProps = {
    title: string
    hint: string
    onSignIn: () => void
}

export function AccessGate(props: AccessGateProps) {
    return (
        <div class="access-gate">
            <div class="access-gate__card">
                <span class="access-gate__icon">
                    <Lock size={22} aria-hidden="true" />
                </span>
                <h2 class="access-gate__title">{props.title}</h2>
                <p class="access-gate__hint">{props.hint}</p>
                <button class="terminal-button terminal-button--icon" type="button" onClick={() => props.onSignIn()}>
                    <LogIn size={16} aria-hidden="true" />
                    <span>Continuar con Google</span>
                </button>
            </div>
        </div>
    )
}

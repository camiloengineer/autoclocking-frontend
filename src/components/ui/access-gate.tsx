import { Lock } from 'lucide-solid'
import { LoginForm } from '../../features/auth/ui/login-form'

type AccessGateProps = {
    title: string
    hint: string
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
                <LoginForm />
            </div>
        </div>
    )
}

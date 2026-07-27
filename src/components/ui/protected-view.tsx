import { Show, type JSX } from 'solid-js'
import { AccessGate } from './access-gate'
import { session } from '../../features/auth/application/auth-store'

export function ProtectedView(props: { children: JSX.Element }) {
    const isAccessRestricted = () => !session()

    return (
        <div class="app-content">
            <div class="app-content__view" classList={{ 'app-content__view--gated': isAccessRestricted() }} inert={isAccessRestricted() || undefined}>
                {props.children}
            </div>
            <Show when={isAccessRestricted()}>
                <AccessGate title="Restricted section" hint="Sign in with your Buk account — the same email and password you use to clock in. A valid login registers you automatically." />
            </Show>
        </div>
    )
}

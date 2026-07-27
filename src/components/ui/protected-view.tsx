import { Show, type JSX } from 'solid-js'
import { AccessGate } from './access-gate'
import { LoadingState } from './loading-state'
import { handleSignIn, session, status } from '../../features/auth/application/auth-store'

export function ProtectedView(props: { children: JSX.Element }) {
    const isAccessRestricted = () => !session()

    return (
        <div class="app-content">
            <div class="app-content__view" classList={{ 'app-content__view--gated': isAccessRestricted() }} inert={isAccessRestricted() || undefined}>
                {props.children}
            </div>
            <Show when={isAccessRestricted()}>
                <Show when={status() === 'signed-out'} fallback={<div class="access-gate"><LoadingState withShell={false} /></div>}>
                    <AccessGate title="Restricted section" hint="Sign in with an authorized Google account to view private automation data." onSignIn={handleSignIn} />
                </Show>
            </Show>
        </div>
    )
}

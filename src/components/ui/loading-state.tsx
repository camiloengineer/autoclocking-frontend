import { Show } from 'solid-js'

type LoadingStateProps = {
    withShell?: boolean
}

export function LoadingState(props: LoadingStateProps) {
    return (
        <Show
            when={props.withShell !== false}
            fallback={
                <div class="loading-grid" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
            }
        >
            <div class="history-fallback">
                <div class="loading-grid" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
            </div>
        </Show>
    )
}

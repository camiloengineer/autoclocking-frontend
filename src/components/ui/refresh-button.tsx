import { RefreshCw } from 'lucide-solid'

type RefreshButtonProps = {
    busy: boolean
    onClick: () => void | Promise<void>
    idleLabel?: string
    busyLabel?: string
}

export function RefreshButton(props: RefreshButtonProps) {
    return (
        <button class="terminal-button terminal-button--icon" type="button" onClick={() => props.onClick()} disabled={props.busy}>
            <RefreshCw size={16} aria-hidden="true" />
            <span>{props.busy ? props.busyLabel ?? 'Refreshing' : props.idleLabel ?? 'Refresh'}</span>
        </button>
    )
}

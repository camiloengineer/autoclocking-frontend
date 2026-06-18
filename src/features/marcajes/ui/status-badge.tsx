import type { JSX } from 'solid-js'

type StatusBadgeProps = {
    tone: 'success' | 'danger' | 'neutral' | 'accent'
    variant?: 'status' | 'action'
    children: JSX.Element
}

export function StatusBadge(props: StatusBadgeProps) {
    const variant = props.variant ?? 'status'

    return <span class={`status-badge status-badge--${variant} status-badge--${props.tone}`}>{props.children}</span>
}

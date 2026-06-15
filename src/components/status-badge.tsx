import type { JSX } from 'solid-js'

type StatusBadgeProps = {
    tone: 'success' | 'danger' | 'neutral' | 'accent'
    children: JSX.Element
}

export function StatusBadge(props: StatusBadgeProps) {
    return <span class={`status-badge status-badge--${props.tone}`}>{props.children}</span>
}

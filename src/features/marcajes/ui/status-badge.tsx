import { createMemo, type JSX } from 'solid-js'

type StatusBadgeProps = {
    tone: 'success' | 'danger' | 'neutral' | 'accent'
    variant?: 'status' | 'action'
    children: JSX.Element
}

export function StatusBadge(props: StatusBadgeProps) {
    const variant = createMemo(() => props.variant ?? 'status')
    const className = createMemo(() => `status-badge status-badge--${variant()} status-badge--${props.tone}`)

    return <span class={className()}>{props.children}</span>
}

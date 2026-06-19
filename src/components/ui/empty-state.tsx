import type { JSX } from 'solid-js'

type EmptyStateProps = {
    title: string
    description: JSX.Element
    icon?: JSX.Element
}

export function EmptyState(props: EmptyStateProps) {
    return (
        <div class="empty-state">
            {props.icon}
            <h3>{props.title}</h3>
            <p>{props.description}</p>
        </div>
    )
}

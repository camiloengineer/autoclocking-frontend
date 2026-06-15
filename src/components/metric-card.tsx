type MetricCardProps = {
    label: string
    value: string
    detail: string
    tone?: 'default' | 'accent'
}

export function MetricCard(props: MetricCardProps) {
    return (
        <article class={`panel metric-card ${props.tone === 'accent' ? 'metric-card--accent' : ''}`}>
            <span class="panel-label">{props.label}</span>
            <strong class="metric-card__value">{props.value}</strong>
            <span class="panel-detail">{props.detail}</span>
        </article>
    )
}

import type { JSX } from 'solid-js'

type PanelHeaderProps = {
    title: string
    detail: JSX.Element
    action?: JSX.Element
}

export function PanelHeader(props: PanelHeaderProps) {
    return (
        <div class="panel-header">
            <div>
                <h2>{props.title}</h2>
                <p class="panel-detail">{props.detail}</p>
            </div>
            {props.action}
        </div>
    )
}

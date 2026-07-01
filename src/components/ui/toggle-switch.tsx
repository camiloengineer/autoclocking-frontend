type ToggleSwitchProps = {
    checked: boolean
    label: string
    disabled?: boolean
    onChange: (next: boolean) => void
}

export function ToggleSwitch(props: ToggleSwitchProps) {
    return (
        <label class="toggle-switch" classList={{ 'toggle-switch--disabled': props.disabled }}>
            <input
                type="checkbox"
                class="toggle-switch__input"
                role="switch"
                checked={props.checked}
                disabled={props.disabled}
                onChange={(event) => props.onChange(event.currentTarget.checked)}
            />
            <span class="toggle-switch__track" aria-hidden="true">
                <span class="toggle-switch__thumb" />
            </span>
            <span class="toggle-switch__label">{props.label}</span>
        </label>
    )
}

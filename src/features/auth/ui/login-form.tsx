import { createSignal, onCleanup, Show } from 'solid-js'
import { LogIn } from 'lucide-solid'
import { signInWithBuk } from '../application/auth-store'
import { AuthError } from '../infra/auth.api'

const FALLBACK_COOLDOWN_SECONDS = 300

function formatCooldown(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function LoginForm() {
    const [email, setEmail] = createSignal('')
    const [password, setPassword] = createSignal('')
    const [isSubmitting, setIsSubmitting] = createSignal(false)
    const [errorMessage, setErrorMessage] = createSignal('')
    const [cooldownSeconds, setCooldownSeconds] = createSignal(0)

    let cooldownTimer: number | undefined

    const startCooldown = (seconds: number) => {
        window.clearInterval(cooldownTimer)
        setCooldownSeconds(seconds)
        cooldownTimer = window.setInterval(() => {
            setCooldownSeconds((current) => {
                if (current <= 1) {
                    window.clearInterval(cooldownTimer)
                    setErrorMessage('')
                    return 0
                }
                return current - 1
            })
        }, 1000)
    }

    onCleanup(() => window.clearInterval(cooldownTimer))

    const applySignInError = (signInError: unknown) => {
        if (!(signInError instanceof AuthError)) {
            setErrorMessage(signInError instanceof Error ? signInError.message : 'Unable to sign in')
            return
        }

        switch (signInError.code) {
            case 'invalid_credentials':
                if (signInError.attemptsLeft !== null && signInError.attemptsLeft <= 0) {
                    setErrorMessage('Buk rejected these credentials. Too many failed attempts — wait before retrying.')
                    startCooldown(FALLBACK_COOLDOWN_SECONDS)
                    return
                }
                setErrorMessage(`Buk rejected these credentials. ${signInError.attemptsLeft ?? 1} attempt left before a cooldown.`)
                return
            case 'throttled':
                setErrorMessage('Too many failed attempts.')
                startCooldown(signInError.retryAfterSeconds ?? FALLBACK_COOLDOWN_SECONDS)
                return
            case 'account_locked':
                setErrorMessage('Buk locked this account. Check your email to unlock it, then sign in again.')
                return
            case 'buk_unreachable':
                setErrorMessage('Buk is not responding. Try again in a moment.')
                return
            default:
                setErrorMessage(signInError.message)
        }
    }

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault()
        if (isSubmitting() || cooldownSeconds() > 0) {
            return
        }

        setIsSubmitting(true)
        setErrorMessage('')

        try {
            await signInWithBuk(email().trim(), password())
        } catch (signInError) {
            applySignInError(signInError)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form class="access-gate__form" onSubmit={handleSubmit}>
            <label class="access-gate__field">
                <span>Corporate email</span>
                <input
                    type="email"
                    value={email()}
                    onInput={(event) => setEmail(event.currentTarget.value)}
                    placeholder="name@robotia.cl"
                    autocomplete="email"
                    required
                />
            </label>
            <label class="access-gate__field">
                <span>Buk password</span>
                <input
                    type="password"
                    value={password()}
                    onInput={(event) => setPassword(event.currentTarget.value)}
                    placeholder="••••••••"
                    autocomplete="current-password"
                    required
                />
            </label>
            <Show when={errorMessage()}>
                <p class="access-gate__error" role="alert">
                    {errorMessage()}
                    <Show when={cooldownSeconds() > 0}> Try again in {formatCooldown(cooldownSeconds())}.</Show>
                </p>
            </Show>
            <button class="terminal-button terminal-button--icon" type="submit" disabled={isSubmitting() || cooldownSeconds() > 0}>
                <LogIn size={16} aria-hidden="true" />
                <span>{cooldownSeconds() > 0 ? `Wait ${formatCooldown(cooldownSeconds())}` : isSubmitting() ? 'Validating' : 'Sign in'}</span>
            </button>
        </form>
    )
}

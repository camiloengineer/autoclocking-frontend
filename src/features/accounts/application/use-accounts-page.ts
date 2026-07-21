import { createMemo, createSignal } from 'solid-js'
import { createQuery, useQueryClient } from '@tanstack/solid-query'
import { createAccount, deleteAccount, fetchAccounts, updateAccountActive } from '../infra/accounts.api'
import { pushToast } from '../../../app/application/toast-store'
import { session } from '../../auth/application/auth-store'
import { ACCOUNTS_QUERY_KEY } from './accounts.constants'

export function useAccountsPage() {
    const queryClient = useQueryClient()
    const [email, setEmail] = createSignal('')
    const [password, setPassword] = createSignal('')
    const [active, setActive] = createSignal(true)
    const [pendingAction, setPendingAction] = createSignal('')

    const isAdmin = createMemo(() => session()?.isAdmin ?? false)

    const accountsQuery = createQuery(() => ({
        queryKey: ACCOUNTS_QUERY_KEY,
        queryFn: () => fetchAccounts(),
        enabled: isAdmin()
    }))

    const rows = createMemo(() => accountsQuery.data?.items ?? [])
    const activeCount = createMemo(() => rows().filter((row) => row.active).length)

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })

    const refreshAccounts = async () => {
        await accountsQuery.refetch()
    }

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault()

        if (!email().trim() || !password()) {
            pushToast('error', 'Enter the corporate email and password')
            return
        }

        setPendingAction('save')

        try {
            await createAccount(email().trim(), password(), active())
            setEmail('')
            setPassword('')
            setActive(true)
            await invalidate()
            pushToast('success', 'Account validated against Buk and saved')
        } catch (saveError) {
            pushToast('error', saveError instanceof Error ? saveError.message : 'Unable to save account')
        } finally {
            setPendingAction('')
        }
    }

    const handleToggle = async (targetEmail: string, nextActive: boolean) => {
        setPendingAction(`toggle:${targetEmail}`)

        try {
            await updateAccountActive(targetEmail, nextActive)
            await invalidate()
            pushToast('success', nextActive ? 'Account activated' : 'Account deactivated')
        } catch (updateError) {
            pushToast('error', updateError instanceof Error ? updateError.message : 'Unable to update account')
        } finally {
            setPendingAction('')
        }
    }

    const handleDelete = async (targetEmail: string) => {
        setPendingAction(`delete:${targetEmail}`)

        try {
            await deleteAccount(targetEmail)
            await invalidate()
            pushToast('success', 'Account deleted')
        } catch (deleteError) {
            pushToast('error', deleteError instanceof Error ? deleteError.message : 'Unable to delete account')
        } finally {
            setPendingAction('')
        }
    }

    return {
        email,
        setEmail,
        password,
        setPassword,
        active,
        setActive,
        pendingAction,
        isAdmin,
        rows,
        activeCount,
        isLoading: () => accountsQuery.isLoading,
        isFetching: () => accountsQuery.isFetching,
        refreshAccounts,
        handleSubmit,
        handleToggle,
        handleDelete
    }
}

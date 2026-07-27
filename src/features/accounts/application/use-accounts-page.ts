import { createMemo, createSignal } from 'solid-js'
import { createQuery, useQueryClient } from '@tanstack/solid-query'
import { deleteAccount, fetchAccounts, updateAccountActive } from '../infra/accounts.api'
import { pushToast } from '../../../app/application/toast-store'
import { handleSignOut, session } from '../../auth/application/auth-store'
import { ACCOUNTS_QUERY_KEY } from './accounts.constants'

export function useAccountsPage() {
    const queryClient = useQueryClient()
    const [pendingAction, setPendingAction] = createSignal('')

    const isAdmin = createMemo(() => session()?.isAdmin ?? false)
    const email = createMemo(() => session()?.email ?? '')
    const isSignedIn = createMemo(() => Boolean(session()))

    const accountsQuery = createQuery(() => ({
        queryKey: ACCOUNTS_QUERY_KEY,
        queryFn: () => fetchAccounts(),
        enabled: isSignedIn()
    }))

    const rows = createMemo(() => {
        const items = accountsQuery.data?.items ?? []
        if (isAdmin()) {
            return items
        }
        return items.filter((item) => item.email === email())
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })

    const refreshAccounts = async () => {
        await accountsQuery.refetch()
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
            if (!isAdmin() && targetEmail === email()) {
                handleSignOut()
            }
        } catch (deleteError) {
            pushToast('error', deleteError instanceof Error ? deleteError.message : 'Unable to delete account')
        } finally {
            setPendingAction('')
        }
    }

    return {
        pendingAction,
        isAdmin,
        rows,
        isLoading: () => accountsQuery.isLoading,
        isFetching: () => accountsQuery.isFetching,
        refreshAccounts,
        handleToggle,
        handleDelete
    }
}

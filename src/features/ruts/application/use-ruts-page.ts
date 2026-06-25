import { createMemo, createSignal } from 'solid-js'
import { createQuery, useQueryClient } from '@tanstack/solid-query'
import { deleteRut, fetchRuts, saveRut, updateRutActive } from '../infra/ruts.api'
import { pushToast } from '../../../app/application/toast-store'
import { RUTS_QUERY_KEY } from './ruts.constants'

export function useRutsPage() {
    const queryClient = useQueryClient()
    const [rut, setRut] = createSignal('')
    const [active, setActive] = createSignal(true)
    const [pendingAction, setPendingAction] = createSignal('')

    const rutsQuery = createQuery(() => ({
        queryKey: RUTS_QUERY_KEY,
        queryFn: () => fetchRuts()
    }))

    const items = createMemo(() => rutsQuery.data?.items ?? [])
    const activeCount = createMemo(() => items().filter((item) => item.active).length)

    const invalidateRuts = async () => {
        await queryClient.invalidateQueries({ queryKey: RUTS_QUERY_KEY })
    }

    const refreshRuts = async () => {
        await rutsQuery.refetch()
    }

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault()
        setPendingAction('save')

        try {
            await saveRut(rut(), active())
            setRut('')
            setActive(true)
            await invalidateRuts()
            pushToast('success', 'RUT added')
        } catch (saveError) {
            pushToast('error', saveError instanceof Error ? saveError.message : 'Unable to save RUT')
        } finally {
            setPendingAction('')
        }
    }

    const handleToggle = async (targetRut: string, nextActive: boolean) => {
        setPendingAction(`toggle:${targetRut}`)

        try {
            await updateRutActive(targetRut, nextActive)
            await invalidateRuts()
            pushToast('success', nextActive ? 'RUT activated' : 'RUT deactivated')
        } catch (updateError) {
            pushToast('error', updateError instanceof Error ? updateError.message : 'Unable to update RUT')
        } finally {
            setPendingAction('')
        }
    }

    const handleDelete = async (targetRut: string) => {
        setPendingAction(`delete:${targetRut}`)

        try {
            await deleteRut(targetRut)
            await invalidateRuts()
            pushToast('success', 'RUT deleted')
        } catch (deleteError) {
            pushToast('error', deleteError instanceof Error ? deleteError.message : 'Unable to delete RUT')
        } finally {
            setPendingAction('')
        }
    }

    return {
        rut,
        setRut,
        active,
        setActive,
        pendingAction,
        items,
        activeCount,
        isLoading: () => rutsQuery.isLoading,
        isFetching: () => rutsQuery.isFetching,
        refreshRuts,
        handleSubmit,
        handleToggle,
        handleDelete
    }
}

import { createMemo, createSignal } from 'solid-js'
import { createQuery, useQueryClient } from '@tanstack/solid-query'
import { deleteRut, fetchRuts, saveRut, updateRutActive } from '../infra/ruts.api'
import { RUTS_QUERY_KEY } from './ruts.constants'

export function useRutsPage() {
    const queryClient = useQueryClient()
    const [rut, setRut] = createSignal('')
    const [active, setActive] = createSignal(true)
    const [pendingAction, setPendingAction] = createSignal('')
    const [error, setError] = createSignal('')

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
        setError('')
        await rutsQuery.refetch()
    }

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault()
        setError('')
        setPendingAction('save')

        try {
            await saveRut(rut(), active())
            setRut('')
            setActive(true)
            await invalidateRuts()
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : 'Unable to save RUT')
        } finally {
            setPendingAction('')
        }
    }

    const handleToggle = async (targetRut: string, nextActive: boolean) => {
        setError('')
        setPendingAction(`toggle:${targetRut}`)

        try {
            await updateRutActive(targetRut, nextActive)
            await invalidateRuts()
        } catch (updateError) {
            setError(updateError instanceof Error ? updateError.message : 'Unable to update RUT')
        } finally {
            setPendingAction('')
        }
    }

    const handleDelete = async (targetRut: string) => {
        setError('')
        setPendingAction(`delete:${targetRut}`)

        try {
            await deleteRut(targetRut)
            await invalidateRuts()
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete RUT')
        } finally {
            setPendingAction('')
        }
    }

    return {
        rut,
        setRut,
        active,
        setActive,
        error,
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

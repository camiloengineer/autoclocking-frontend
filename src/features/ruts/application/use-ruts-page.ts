import { createMemo, createSignal } from 'solid-js'
import { createQuery, useQueryClient } from '@tanstack/solid-query'
import { deleteRut, fetchRuts, saveRut, updateRutActive } from '../infra/ruts.api'
import { deleteRutOwner, fetchAllOwners, fetchOwnersByEmail, setRutOwner } from '../infra/rut-owners.api'
import { pushToast } from '../../../app/application/toast-store'
import { session } from '../../auth/application/auth-store'
import { RUTS_QUERY_KEY, RUT_OWNERS_QUERY_KEY } from './ruts.constants'
import type { RutRow } from '../domain/rut.types'

export function useRutsPage() {
    const queryClient = useQueryClient()
    const [rut, setRut] = createSignal('')
    const [ownerEmail, setOwnerEmail] = createSignal('')
    const [active, setActive] = createSignal(true)
    const [pendingAction, setPendingAction] = createSignal('')

    const isAdmin = createMemo(() => session()?.isAdmin ?? false)
    const email = createMemo(() => session()?.email ?? '')
    const isSignedIn = createMemo(() => Boolean(session()))

    const rutsQuery = createQuery(() => ({
        queryKey: RUTS_QUERY_KEY,
        queryFn: () => fetchRuts(),
        enabled: isSignedIn()
    }))

    const ownersQuery = createQuery(() => ({
        queryKey: [...RUT_OWNERS_QUERY_KEY, isAdmin() ? 'all' : email()],
        queryFn: () => (isAdmin() ? fetchAllOwners() : fetchOwnersByEmail(email())),
        enabled: isSignedIn()
    }))

    const ownerByRut = createMemo(() => {
        const map = new Map<string, string>()
        for (const owner of ownersQuery.data ?? []) {
            map.set(owner.rut, owner.email)
        }
        return map
    })

    const rows = createMemo<RutRow[]>(() => {
        const backendItems = rutsQuery.data?.items ?? []
        const owners = ownerByRut()

        if (isAdmin()) {
            return backendItems.map((item) => ({ ...item, ownerEmail: owners.get(item.rut) ?? '' }))
        }

        return backendItems
            .filter((item) => owners.has(item.rut))
            .map((item) => ({ ...item, ownerEmail: owners.get(item.rut) ?? '' }))
    })

    const activeCount = createMemo(() => rows().filter((row) => row.active).length)

    const invalidateAll = async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: RUTS_QUERY_KEY }),
            queryClient.invalidateQueries({ queryKey: RUT_OWNERS_QUERY_KEY })
        ])
    }

    const refreshRuts = async () => {
        await Promise.all([rutsQuery.refetch(), ownersQuery.refetch()])
    }

    const handleSubmit = async (event: SubmitEvent) => {
        event.preventDefault()

        if (!ownerEmail().trim()) {
            pushToast('error', 'Enter the owner email for this RUT')
            return
        }

        setPendingAction('save')

        try {
            const saved = await saveRut(rut(), active())
            await setRutOwner(saved.rut, ownerEmail())
            setRut('')
            setOwnerEmail('')
            setActive(true)
            await invalidateAll()
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
            await invalidateAll()
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
            await deleteRutOwner(targetRut)
            await invalidateAll()
            pushToast('success', 'RUT deleted')
        } catch (deleteError) {
            pushToast('error', deleteError instanceof Error ? deleteError.message : 'Unable to delete RUT')
        } finally {
            setPendingAction('')
        }
    }

    const handleReassign = async (targetRut: string, nextEmail: string) => {
        const normalized = nextEmail.trim().toLowerCase()
        if (!normalized || normalized === (ownerByRut().get(targetRut) ?? '')) {
            return
        }

        setPendingAction(`reassign:${targetRut}`)

        try {
            await setRutOwner(targetRut, normalized)
            await invalidateAll()
            pushToast('success', 'RUT owner updated')
        } catch (reassignError) {
            pushToast('error', reassignError instanceof Error ? reassignError.message : 'Unable to reassign RUT')
        } finally {
            setPendingAction('')
        }
    }

    return {
        rut,
        setRut,
        ownerEmail,
        setOwnerEmail,
        active,
        setActive,
        pendingAction,
        isAdmin,
        rows,
        activeCount,
        isLoading: () => rutsQuery.isLoading || ownersQuery.isLoading,
        isFetching: () => rutsQuery.isFetching || ownersQuery.isFetching,
        refreshRuts,
        handleSubmit,
        handleToggle,
        handleDelete,
        handleReassign
    }
}

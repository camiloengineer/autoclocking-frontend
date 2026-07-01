import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import { firestoreDb } from '../../auth/infra/firebase'
import type { RutOwner } from '../domain/rut-owner.types'

const OWNERS_COLLECTION = 'rut_owners'

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase()
}

function toOwner(rut: string, email: unknown): RutOwner {
    return { rut, email: String(email ?? '') }
}

export async function fetchAllOwners(): Promise<RutOwner[]> {
    const snapshot = await getDocs(collection(firestoreDb, OWNERS_COLLECTION))
    return snapshot.docs.map((entry) => toOwner(entry.id, entry.data().email))
}

export async function fetchOwnersByEmail(email: string): Promise<RutOwner[]> {
    const ownersQuery = query(collection(firestoreDb, OWNERS_COLLECTION), where('email', '==', normalizeEmail(email)))
    const snapshot = await getDocs(ownersQuery)
    return snapshot.docs.map((entry) => toOwner(entry.id, entry.data().email))
}

export async function setRutOwner(rut: string, email: string): Promise<void> {
    await setDoc(
        doc(firestoreDb, OWNERS_COLLECTION, rut),
        { rut, email: normalizeEmail(email), updatedAt: serverTimestamp() },
        { merge: true }
    )
}

export async function deleteRutOwner(rut: string): Promise<void> {
    await deleteDoc(doc(firestoreDb, OWNERS_COLLECTION, rut))
}

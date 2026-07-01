import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { firebaseAuth, firestoreDb, googleAuthProvider } from './firebase'

/** Registers a listener for Firebase auth state changes and returns the unsubscribe handle. */
export function subscribeToAuthState(onChange: (user: User | null) => void) {
    return onAuthStateChanged(firebaseAuth, onChange)
}

export async function signInWithGoogle(): Promise<void> {
    await signInWithPopup(firebaseAuth, googleAuthProvider)
}

export async function signOutFromGoogle(): Promise<void> {
    await signOut(firebaseAuth)
}

/** Returns true when an admins/{email} document exists for the given email. */
export async function checkIsAdmin(email: string): Promise<boolean> {
    const snapshot = await getDoc(doc(firestoreDb, 'admins', email.trim().toLowerCase()))
    return snapshot.exists()
}

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const DEFAULT_FIREBASE_CONFIG = {
    apiKey: 'AIzaSyA5juPJ2k13_C1NusQyhKA8VCnhuHQ9wzU',
    authDomain: 'reportability-frontend-staging.firebaseapp.com',
    projectId: 'reportability-frontend-staging',
    storageBucket: 'reportability-frontend-staging.firebasestorage.app',
    messagingSenderId: '1019892014446',
    appId: '1:1019892014446:web:f0f110b558ca5d4180357f'
}

const DEFAULT_DATABASE_ID = 'autoclocking'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId
}

const firebaseApp = initializeApp(firebaseConfig)

export const firebaseAuth = getAuth(firebaseApp)

export const googleAuthProvider = new GoogleAuthProvider()

export const firestoreDb = getFirestore(firebaseApp, import.meta.env.VITE_FIREBASE_DB_ID || DEFAULT_DATABASE_ID)

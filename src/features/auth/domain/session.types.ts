export type AppSession = {
    email: string
    displayName: string
    isAdmin: boolean
}

export type AuthStatus = 'loading' | 'signed-out' | 'signed-in'

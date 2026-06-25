export const RUT_ACCESS_ALLOWLIST = [
    'jaimearayajerez@gmail.com',
    'camilo@camiloengineer.com',
    'roertazon@gmail.com'
] as const

/** Returns true when the given email belongs to the hardcoded RUT maintainer allowlist. */
export function isRutAccessGranted(email: string): boolean {
    const normalized = email.trim().toLowerCase()
    return RUT_ACCESS_ALLOWLIST.some((allowed) => allowed === normalized)
}

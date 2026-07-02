export const APP_NAV_ITEMS = [
    { path: '/clock-ins', label: 'Clock-ins', isPublic: false },
    { path: '/ruts', label: 'RUTs', isPublic: false },
    { path: '/holidays', label: 'Holidays', isPublic: true },
    { path: '/healthcheck', label: 'Healthcheck', isPublic: true }
] as const

export const APP_REPOSITORY_LINKS = [
    {
        href: 'https://github.com/camiloengineer/autoclocking-backend/',
        label: 'Backend repo'
    },
    {
        href: 'https://github.com/camiloengineer/autoclocking-frontend/',
        label: 'Frontend repo'
    }
] as const

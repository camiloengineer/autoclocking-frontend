export const APP_PAGES = ['dashboard', 'ruts', 'holidays', 'healthcheck'] as const

export type AppPage = (typeof APP_PAGES)[number]

export const APP_NAV_ITEMS: Array<{ id: AppPage; label: string }> = [
    { id: 'dashboard', label: 'Clock-ins' },
    { id: 'ruts', label: 'RUTs' },
    { id: 'holidays', label: 'Holidays' },
    { id: 'healthcheck', label: 'Healthcheck' }
]

export const APP_REPOSITORY_LINKS = [
    {
        href: 'https://github.com/camiloengineer/autoclocking-backend/',
        label: 'backend repo'
    },
    {
        href: 'https://github.com/camiloengineer/autoclocking-frontend/',
        label: 'frontend repo'
    }
] as const

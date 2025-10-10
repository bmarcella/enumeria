export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    OTPEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
    activeNavTranslation: boolean,
    byPassLogin: boolean
}

const appConfig: AppConfig = {
    apiPrefix: '/api',
    authenticatedEntryPath: '/home',
    OTPEntryPath: '/verified',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'fr',
    accessTokenPersistStrategy: 'cookies',
    enableMock: false,
    activeNavTranslation: true,
    byPassLogin: import.meta.env.VITE_BYPASSLOGIN
}

export default appConfig

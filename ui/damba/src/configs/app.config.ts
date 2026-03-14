export type AppConfig = {
    apiPrefix: string
    authenticatedEntryPath: string
    unAuthenticatedEntryPath: string
    authenticatedProjectPath: string
    OTPEntryPath: string
    locale: string
    accessTokenPersistStrategy: 'localStorage' | 'sessionStorage' | 'cookies'
    enableMock: boolean
    activeNavTranslation: boolean,
    byPassLogin: boolean
}

const appConfig: AppConfig = {
    apiPrefix: import.meta.env.VITE_API_URL,
    authenticatedEntryPath: '/home',
    authenticatedProjectPath: '/projects',
    OTPEntryPath: '/verified',
    unAuthenticatedEntryPath: '/sign-in',
    locale: 'en',
    accessTokenPersistStrategy: 'localStorage',
    enableMock: false,
    activeNavTranslation: true,
    byPassLogin: true
}

export default appConfig

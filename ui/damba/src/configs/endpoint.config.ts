export const apiPrefix = '/api/v1'

const endpointConfig = {
    signIn: '/sign-in',
    signOut: '/auth/logout',
    signUp: '/sign-up',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    signInWithGoogle: '/auth/google/exchange',

    // SERVICES
    organizations: '/organizations',
    projects: '/projects',
    entities: '/entities',
    applications: '/applications',
    users: '/users',
    modules: '/modules',
    services: '/services',
    auth: '/auth',
    behavior: '/behavior',
}

export default endpointConfig

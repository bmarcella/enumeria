export const apiPrefix = '/api'

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
    applications: '/applications'
}

export default endpointConfig

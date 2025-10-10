/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react'
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    User,
    OauthSignInCallbackPayload,
} from '@/@types/auth'

type Auth = {
    byPassLogin: boolean,
    setByPassLogin: (value: boolean)=>void
    authenticated: boolean
    user: User
    signIn: (values: SignInCredential) => AuthResult
    signUp: (values: SignUpCredential) => AuthResult
    redirectTo: () => void
    signOut: () => void
    oAuthSignIn: (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => void
}

const defaultFunctionPlaceHolder = async (): AuthResult => {
    await new Promise((resolve) => setTimeout(resolve, 0))
    return {
        status: '',
        message: '',
    }
}

const defaultOAuthSignInPlaceHolder = (
    callback: (payload: OauthSignInCallbackPayload) => void,
): void => {
    callback({
        onSignIn: () => {},
        redirect: () => {},
    })
}

const AuthContext = createContext<Auth>({
    byPassLogin : true,
    authenticated: false,
    user: {},
    setByPassLogin: async (value:boolean) => defaultFunctionPlaceHolder(),
    signIn: async () => defaultFunctionPlaceHolder(),
    signUp: async () => defaultFunctionPlaceHolder(),
    redirectTo: async () => defaultFunctionPlaceHolder(),
    signOut: () => {},
    oAuthSignIn: defaultOAuthSignInPlaceHolder,
})

export default AuthContext

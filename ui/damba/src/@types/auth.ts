/* eslint-disable @typescript-eslint/no-explicit-any */

import { Profil } from "@/views/Entity"


export type SignInCredential = {
    email: string
    password: string
}

export type SignInResponse = {
    error?: boolean
    message?: string
    token: string
    user: {
        userId: string
        firstName: string
        lastName: string
        userName: string
        authority: string[]
        avatar: string
        email: string
    }
}

export type SignUpResponse = SignInResponse & {
    refreshToken: string,
    data: any
}

export type SignUpCredential = {
    fullName: string
    email: string
    password: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    password: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string,
    data?: any
}>

export type User = {
    userId?: string;
    avatar?: string ;
    userName?: string;
    email?: string | undefined | null
    authority?: string[],
    profilId?: string | null
    profil?: Profil;
    active?: boolean;
}

export type Token = {
    accessToken: string
    refereshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}

import endpointConfig from "@/configs/endpoint.config"
import ApiService from "./ApiService"

/* eslint-disable @typescript-eslint/no-explicit-any */
type OAuthResponse = {
    token: string
    user: {
        id: string
        name: string
        email: string
    }
}

async function placeholderFunction(): Promise<OAuthResponse> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                token: 'placeholder_token',
                user: {
                    id: 'placeholder_id',
                    name: 'Placeholder User',
                    email: 'user@example.com',
                },
            })
        }, 500)
    })
}


export async function apiGoogleOauthSignIn( code: any ) {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signInWithGoogle,
        method: 'post',
        data : { code }
    })
}
   

export async function apiGithubOauthSignIn(): Promise<OAuthResponse> {
    return await placeholderFunction()
}

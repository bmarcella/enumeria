/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from '@/components/ui/Button'
import { useAuth } from '@/auth'
import {
    apiGoogleOauthSignIn,
} from '@/services/OAuthServices'
import { useEffect } from 'react'
import { AuthErrorDTO, AuthResponseDTO } from '../../../../../../../common/Entity/UserDto';
type OauthSignInProps = {
    setMessage?: (message: string) => void
    disableSubmit?: boolean
}

const OauthSignIn = ({ setMessage, disableSubmit }: OauthSignInProps) => {
    const { oAuthSignIn } = useAuth();
    const AuthUser = async (resp: AuthErrorDTO ) => {
          if (resp.code) {
             if (!disableSubmit) {
                oAuthSignIn(async ({ redirect, onSignIn }) => {
                    try {
                        const auth = await apiGoogleOauthSignIn(resp.code!) as AuthResponseDTO;
                        const { user, tokens } = auth;
                        user.authority = user.authority?.map((r: any) => r.name);
                        // TODO: Remove this console log in production
                        console.log('Google OAuth response:', auth);
                        if (auth.tokens && user) {
                           onSignIn( tokens,  user )
                           redirect()
                        }
                    } catch (error) {
                        setMessage?.((error as string)?.toString() || '')
                    }
                })
           }
        }
   }
    useEffect(() => {
    // Charger GIS en français
    const s = document.createElement('script');
    s.src = import.meta.env.VITE_GOOGLE_SRC!+'?hl=fr';
    s.async = true;
    s.onload = () => {
      // @ts-ignore
      const client = google.accounts.oauth2.initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
        scope: import.meta.env.VITE_GOOGLE_SCOPE!,
        ux_mode: import.meta.env.VITE_GOOGLE_UX_MODE! || 'popup',
        callback: AuthUser,
      });
      (window as any)._gisClient = client;
    };
    document.body.appendChild(s);
    }, []);
    
    const handleGoogleSignIn = async () => {
           (window as any)._gisClient?.requestCode();
    }


    return (
        <div className="flex items-center gap-2">
            <Button
                className="flex-1"
                type="button"
                onClick={handleGoogleSignIn}
            >
                <div className="flex items-center justify-center gap-2">
                    <img
                        className="h-[25px] w-[25px]"
                        src="/img/others/google.png"
                        alt="Google sign in"
                    />
                    <span>Google</span>
                </div>
            </Button>
          
        </div>
    )
}

export default OauthSignIn

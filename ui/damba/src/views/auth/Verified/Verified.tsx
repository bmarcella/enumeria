import { useAuth } from '@/auth';
import FirebaseAuth from '@/services/firebase/FirebaseAuth';
import { onAuthStateChanged, reload } from 'firebase/auth';
import { useEffect } from 'react';
import ResendEmailVerification from '../SharedComponents/ResendEmailVerification';

export const  VerifiedBase = () => {
    const { redirectTo } = useAuth();
  useEffect(()=>{
      onAuthStateChanged(FirebaseAuth, async (user) => {
                    if (!user) {
                        // show sign-in / sign-up screen
                        return;
                    }
                    await reload(user); // refresh user.emailVerified from server
                    if (user.emailVerified) {
                        redirectTo();
                    } else {
                        // show “Please verify your email” screen + “Resend email” button
                    }
             });
  });  
  return (
    <div>
        <ResendEmailVerification showTimer={false} />
    </div>
  )
}


const Verified = () => {
    return <VerifiedBase />
}

export default Verified
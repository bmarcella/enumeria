import FirebaseAuth from '@/services/firebase/FirebaseAuth';
import { sendEmailVerification } from 'firebase/auth';
import { useEffect, useState } from 'react';
interface Props {
    showTimer: boolean 
}
function ResendEmailVerification({ showTimer = true }: Props) {
    const [chrono, setChrono] = useState(60);
    const [showSendBtn, setShowSendBtn] = useState(false);
    useEffect(() => {
      if(chrono>0 && showTimer) startChrono();
    }, [chrono]);

    const startChrono = ()=> {
     const $timer =   setTimeout(()=>{
      setChrono((chrono-1));
       if(chrono<=0){
        setShowSendBtn(true);
        clearTimeout($timer);
       } 
    }, 1000)
    }

    const handleResendEmail = async ()=> {
            const user = FirebaseAuth.currentUser;
            if (user && !user.emailVerified) {
                await sendEmailVerification(user);
            }
            setShowSendBtn(false);
            setChrono(60);
    }
  return (
    <div> 
       { showTimer && <div className="mt-4 text-center">
                <span className="font-semibold">Din&apos;t receive the email? </span>
                { showSendBtn && <button
                    className="heading-text font-bold underline"
                    onClick={handleResendEmail}
                >
                    Resend email
                </button> }

                  { !showSendBtn && <div>
                      { chrono }
                  </div> }

            </div>
        }
    </div>
  )
}

export default ResendEmailVerification
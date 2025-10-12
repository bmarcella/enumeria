
import ResendEmailVerification from '../SharedComponents/ResendEmailVerification';

export const  VerifiedBase = () => {
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
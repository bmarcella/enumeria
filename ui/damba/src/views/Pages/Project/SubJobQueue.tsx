/* eslint-disable @typescript-eslint/no-explicit-any */

import SubJob from './SubJob'
interface Props {
    jobs: any[]
}
function SubJobQueue({ jobs }: Props) {
    return (
        <>
            {jobs.map((job, index) => (
                <SubJob key={index} job={job}></SubJob>
            ))}
        </>
    )
}

export default SubJobQueue

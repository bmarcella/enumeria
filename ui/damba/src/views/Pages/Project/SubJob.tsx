/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
interface Props {
    job: any
}
function SubJob({ job }: Props) {
    return <> {job}</>
}

export default SubJob

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from 'react'

interface Props {
    name: string
    children?: ReactNode
}

const DambaHeader = (props: Props) => {
    return (
        <div className="flex items-center justify-between gap-4">
            <h3>{props.name}</h3>
            {props.children && <div>{props.children}</div>}
        </div>
    )
}
export default DambaHeader

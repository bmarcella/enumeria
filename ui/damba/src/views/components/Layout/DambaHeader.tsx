/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from '@/components/ui/Button'
import { ReactNode } from 'react'

interface Props {
    name: string
    button?: {
        onClick: (e: any) => void
        label: string
        icon: ReactNode
    }
}

const DambaHeader = (props: Props) => {
    return (
        <div className="flex items-center justify-between gap-4">
            <h3>{props.name}</h3>
            {props?.button && (
                <div>
                    <Button
                        variant="solid"
                        icon={props.button.icon}
                        onClick={props.button.onClick}
                    >
                        {props.button.label}
                    </Button>
                </div>
            )}
        </div>
    )
}
export default DambaHeader

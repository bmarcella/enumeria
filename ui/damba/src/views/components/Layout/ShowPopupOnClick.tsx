/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Button from '@/components/ui/Button'
import classNames from '@/components/ui/utils/classNames'
import { useDialogContext } from '@/providers/DialogProvider'
import { ReactNode } from 'react'
import { HiPlusCircle } from 'react-icons/hi'
export type BtnVariant = 'solid' | 'plain' | 'default'
interface Props {
    children: ReactNode
    title: string
    btnText?: string
    size?: any
    variant?: BtnVariant
    css?: string
}
const ShowPopupOnClick = ({
    children,
    title,
    btnText,
    size = 'md',
    variant = 'solid',
    css = 'm-2',
}: Props) => {
    const { configDialog } = useDialogContext()
    const ShowDialog = () => {
        configDialog({
            title: title,
            isOpen: true,
            children,
            size,
        })
    }
    return (
        <Button
            size={size}
            variant={variant as BtnVariant}
            className={classNames(css)}
            icon={<HiPlusCircle />}
            onClick={ShowDialog}
        >
            {btnText && <span> {btnText} </span>}
        </Button>
    )
}

export default ShowPopupOnClick

/* eslint-disable @typescript-eslint/no-explicit-any */


import Button from "@/components/ui/Button"
import { useDialogContext } from "@/providers/DialogProvider"
import { ReactNode } from "react"
import { HiPlusCircle } from "react-icons/hi"

interface Props {
    children: ReactNode,
    title: string,
    btnText?: string,
    size?: any
}
const AddProject = ({ children, title, btnText, size }: Props) => {
    const { configDialog } = useDialogContext()
    const ShowDialog = () => {
        configDialog({
            title: title,
            isOpen: true,
            children,
            size
        })
    }
    return (
        <Button size="xs" className="mr-2" icon={<HiPlusCircle />} onClick={ShowDialog}>
            { btnText &&<span> {btnText} </span>}
        </Button>
    )
}

export default AddProject

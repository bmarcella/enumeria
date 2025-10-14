

import Button from "@/components/ui/Button"
import { useDialogContext } from "@/providers/DialogProvider"
import { ReactNode } from "react"
import { HiPlusCircle } from "react-icons/hi"

interface Props {
    children: ReactNode,
    title: string,
}
const AddProject = ({ children, title }: Props) => {
    const { configDialog } = useDialogContext()
    const ShowDialog = () => {
        configDialog({
            title: title,
            isOpen: true,
            children
        })
    }
    return (
        <Button className="mr-2" icon={<HiPlusCircle />} onClick={ShowDialog}>
            <span>Project</span>
        </Button>
    )
}

export default AddProject


import { useEffect, useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import type {  ReactNode } from 'react'
interface Props {
    title: string,
    children: ReactNode;
    isOpen: boolean
    close: () => void
}
const DambaDialog = ({ title, children, isOpen = false, close }: Props) => {
    const [dialogIsOpen, setIsOpen] = useState(isOpen);

    useEffect(() => {
        setIsOpen(isOpen);
    }, [isOpen]);

    const onDialogClose = () => {
        setIsOpen(false);
        close();
    }



    return (
        <div>
            <Dialog
                isOpen={dialogIsOpen}
                bodyOpenClassName="overflow-hidden"
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">{title}</h5>
                {children}
            </Dialog>
        </div>
    )
}

export default DambaDialog


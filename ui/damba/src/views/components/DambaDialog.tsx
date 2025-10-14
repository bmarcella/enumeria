
import { useEffect, useState } from 'react'
import Dialog from '@/components/ui/Dialog'
import type { MouseEvent, ReactNode } from 'react'
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

    const onDialogOk = (e: MouseEvent) => {
        console.log('onDialogOk', e)
        setIsOpen(false)
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
                {/* <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onDialogClose}
                    >
                        Cancel
                    </Button>
                    <Button variant="solid" onClick={onDialogOk}>
                        Okay
                    </Button>
                </div> */}
            </Dialog>
        </div>
    )
}

export default DambaDialog


/* eslint-disable @typescript-eslint/no-explicit-any */

import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { useState } from 'react';
import { CgClose } from 'react-icons/cg'

function YesOrNoPopup( { id,  Ok , title= "Voulez-vous vraiment supprimer ceci ?", desc=""}: any) {
    const [ynOpen, setYnOpen] = useState(false); 
            const openDialogYON = () => { 
                setYnOpen(true);
            }
        
            const onDialogCloseYON  = () => {
                setYnOpen(false);
            }
            const onOk = () => {
                Ok(id);
                setYnOpen(false);
            }
  return (
    <div>
        
             <Button shape="circle" size="xs" className="mt-2 hover:text-red-800 dark:hover:bg-red-600 border-0 hover:ring-0" onClick={() => openDialogYON()}>
                              <CgClose />
             </Button>         

          <Dialog
                isOpen={ynOpen}
                onClose={onDialogCloseYON}
                onRequestClose={onDialogCloseYON}
            >
                <h5 className="mb-4">{ title }</h5>
                <p>
                  { desc }
                </p>
                <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onDialogCloseYON}
                    >
                        Non
                    </Button>
                    <Button variant="solid" onClick={onOk}>
                        Oui
                    </Button>
                </div>
            </Dialog>
    </div>
  )
}

export default YesOrNoPopup
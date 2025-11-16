// providers/ProjectProvider.tsx
import DambaDialog from '@/views/components/DambaDialog';
import { createContext, ReactNode, useContext, useState } from 'react';
type DialogContextProps = {
  setTitle: (title: string) => void
  setIsOpen: (isOpen: boolean) => void
  configDialog: (config: DialogConfig) => void,
  closeDialog: () => void
}

export type DialogConfig = {
  title?: string,
  isOpen: boolean,
  children?: ReactNode
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined)
type Props = {
  children: React.ReactNode;
};

export function DialogProvider({
  children,
}: Props) {
  const [dialogIsOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState<string>("");
  const [dialogChildren, setDialogChildren] = useState<ReactNode>("");

  const configDialog = (config: DialogConfig) => {
    setTitle(config.title!);
    setIsOpen(config.isOpen)
    setDialogChildren(config.children!)
  }
  const closeDialog = () => {
    setIsOpen(false)
  }

  return (<DialogContext.Provider value={{ setTitle, setIsOpen, configDialog, closeDialog }}>
    {children}
    <DambaDialog title={title}  isOpen={dialogIsOpen} close={closeDialog}>
      {dialogChildren}
    </DambaDialog>
  </DialogContext.Provider>);
}

export function useDialogContext() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialogContext must be used within ProjectProvider')
  return ctx
}
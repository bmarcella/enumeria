import Menu from '@/components/ui/Menu'
import type { ReactNode } from 'react'
import { useApplicationStore } from '@/stores/useApplicationStore'
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlineOfficeBuilding,
  HiOutlineCog,
  HiOutlineCode,
} from 'react-icons/hi'

const MenuContent = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-2xl">{icon}</span>
    <span>{label}</span>
  </div>
)

const SidebarDamba = () => {
  const app = useApplicationStore((s) => s.cApp)

  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-md p-2"
      style={{ maxWidth: 250 }}
    >
      <Menu>
        <Menu.MenuItem eventKey="application">
          <MenuContent icon={<HiOutlineViewGrid />} label={app?.name || 'Application'} />
        </Menu.MenuItem>

         <Menu.MenuItem eventKey="editor">
             <MenuContent icon={<HiOutlineCode />} label={ 'Editor'} />
         </Menu.MenuItem>

        <Menu.MenuItem eventKey="project">
          <MenuContent icon={<HiOutlineFolder />} label="Project" />
        </Menu.MenuItem>

        <Menu.MenuItem eventKey="Organition">
          <MenuContent icon={<HiOutlineOfficeBuilding />} label="Organization" />
        </Menu.MenuItem>
        <Menu.MenuItem eventKey="Setting"> <MenuContent icon={<HiOutlineCog />} label={"Setting"} /> </Menu.MenuItem>
      </Menu>
    </div>
  )
}

export default SidebarDamba

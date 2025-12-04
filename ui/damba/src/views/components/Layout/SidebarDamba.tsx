
import Menu from '@/components/ui/Menu'
import {
    HiOutlineCog,
    HiOutlineChat,
    HiOutlineGlobeAlt,
    HiOutlineSupport,
    HiWifi,
} from 'react-icons/hi'
import type { ReactNode } from 'react'
import { useApplicationStore } from '@/stores/useApplicationStore'

const MenuContent = ({ icon, label }: { icon: ReactNode, label: string }) => {
    return (
        <div className="flex items-center gap-2">
            <span className={'text-2xl'}>{icon}</span>
            <span>{label}</span>
        </div>
    )
}

const SidebarDamba = () => {
     const app = useApplicationStore((s) => s.cApp)
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-md p-2" style={{ maxWidth: 250 }}>
            <Menu>
                <Menu.MenuItem eventKey="settings">
                    <MenuContent icon={<HiOutlineCog />} label={ app?.name || "Application"} />
                </Menu.MenuItem>
                <Menu.MenuItem eventKey="messages">
                    <MenuContent icon={<HiOutlineChat />} label="Messages" />
                </Menu.MenuItem>
                <Menu.MenuCollapse
                    eventKey="others"
                    label={
                        <MenuContent
                            icon={<HiOutlineCog />}
                            label="Network"
                        />
                    }
                >
                    <Menu.MenuItem eventKey="wifi">
                        <MenuContent icon={<HiWifi />} label="Wifi" />
                    </Menu.MenuItem>
                    <Menu.MenuItem eventKey="support">
                        <MenuContent
                            icon={<HiOutlineSupport />}
                            label="Support"
                        />
                    </Menu.MenuItem>
                </Menu.MenuCollapse>
            </Menu>
        </div>
    )
}

export default SidebarDamba


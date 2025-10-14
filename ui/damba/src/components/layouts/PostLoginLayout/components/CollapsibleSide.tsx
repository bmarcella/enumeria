import SideNav from '@/components/template/SideNav'
import Header from '@/components/template/Header'
import SideNavToggle from '@/components/template/SideNavToggle'
import MobileNav from '@/components/template/MobileNav'
import UserProfileDropdown from '@/components//template/UserProfileDropdown'
import LayoutBase from '@/components//template/LayoutBase'
import useResponsive from '@/utils/hooks/useResponsive'
import { LAYOUT_COLLAPSIBLE_SIDE } from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'
import { InputGroup } from '@/components/ui/InputGroup'
import { AppSwitcher } from '../../../../views/components/AppSwitcher'
import { useProjectContext } from '@/providers/ProjectProvider'
import { OrgSwitcher } from '@/views/components/OrgSwitcher'
import { ProjSwitcher } from '@/views/components/ProjSwitcher'

const CollapsibleSide = ({ children }: CommonProps) => {
    const { larger, smaller } = useResponsive()

    const { initProject } = useProjectContext()
    return (
        <LayoutBase
            type={LAYOUT_COLLAPSIBLE_SIDE}
            className="app-layout-collapsible-side flex flex-auto flex-col"
        >
            <div className="flex flex-auto min-w-0">
                {larger.lg && <SideNav />}
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    <Header
                        className="shadow-sm dark:shadow-2xl"
                        headerStart={
                            <>
                                {smaller.lg && <MobileNav />}
                                {larger.lg && <SideNavToggle />}
                            </>
                        }
                        orgSwitcher={
                            <>
                                <InputGroup className="mt-6 mb-6">
                                    <OrgSwitcher ></OrgSwitcher>
                                    <ProjSwitcher initialized={initProject}></ProjSwitcher>
                                    <AppSwitcher ></AppSwitcher>
                                </InputGroup>
                            </>
                        }
                        headerEnd={
                            <>
                                <UserProfileDropdown hoverable={false} />
                            </>
                        }
                    />
                    <div className="h-full flex flex-auto flex-col">
                        {children}
                    </div>
                </div>
            </div>
        </LayoutBase>
    )
}

export default CollapsibleSide

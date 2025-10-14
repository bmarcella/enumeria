/* eslint-disable @typescript-eslint/no-unused-vars */
import Header from '@/components/template/Header'
import UserProfileDropdown from '@/components//template/UserProfileDropdown'
import HeaderLogo from '@/components/template/HeaderLogo'
import MobileNav from '@/components/template/MobileNav'
import HorizontalNav from '@/components/template/HorizontalNav'
import LayoutBase from '@/components//template/LayoutBase'
import useResponsive from '@/utils/hooks/useResponsive'
import { LAYOUT_TOP_BAR_CLASSIC } from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'
import { useProjectContext } from '@/providers/ProjectProvider'
import { InputGroup } from '@/components/ui/InputGroup'
import { AppSwitcher } from '../../../../views/components/AppSwitcher'
import { OrgSwitcher } from '@/views/components/OrgSwitcher'
import { ProjSwitcher } from '@/views/components/ProjSwitcher'
const TopBarClassic = ({ children }: CommonProps) => {
    const { larger, smaller } = useResponsive();
    const { initProject } = useProjectContext()
    return (
        <LayoutBase
            type={LAYOUT_TOP_BAR_CLASSIC}
            className="app-layout-top-bar-classic flex flex-auto flex-col min-h-screen"
        >
            <div className="flex flex-auto min-w-0">
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    <Header
                        container
                        className="shadow-sm dark:shadow-2xl"
                        headerStart={
                            <>
                                {smaller.lg && <MobileNav />}
                                <HeaderLogo />
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
                        headerMiddle={<>{larger.lg && <HorizontalNav />}</>}
                        headerEnd={
                            <UserProfileDropdown hoverable={false} />
                        }
                    />
                    {children}
                </div>
            </div>
        </LayoutBase>
    )
}

export default TopBarClassic

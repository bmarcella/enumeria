import {
    PiHouseLineDuotone,
    PiArrowsInDuotone,
    PiBookOpenUserDuotone,
    PiBookBookmarkDuotone,
    PiAcornDuotone,
    PiBagSimpleDuotone,
    PiBankDuotone,
    PiUsers,
} from 'react-icons/pi'
import type { JSX } from 'react'
import { BiCog, BiMoney } from 'react-icons/bi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <PiHouseLineDuotone />,
    bankMenu: <PiBankDuotone />,
    proprioMenu: <PiUsers />,
    configMenu: <BiCog />,
    reqMenu: <BiMoney />,
    singleMenu: <PiAcornDuotone />,
    collapseMenu: <PiArrowsInDuotone />,
    groupSingleMenu: <PiBookOpenUserDuotone />,
    groupCollapseMenu: <PiBookBookmarkDuotone />,
    groupMenu: <PiBagSimpleDuotone />,
}

export default navigationIcon

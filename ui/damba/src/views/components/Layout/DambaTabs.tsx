import Tabs from '@/components/ui/Tabs'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import classNames from '@/utils/classNames'
import { ReactNode, useEffect, useMemo, useState } from 'react'

export interface DambaTabItem {
    value?: string
    title?: string
    label?: string
    content: ReactNode
    icon?: ReactNode
}

interface DambaTabProps {
    items: DambaTabItem[]
    onChange?: (value: string) => void
    currentTab: string
    disposition?: string
}

function DambaTabs({
    items,
    onChange,
    currentTab,
    disposition = 'justify-end',
}: DambaTabProps) {
    const getValue = (tab: DambaTabItem, index: number) =>
        tab.value ?? tab.title ?? String(index)
    const values = useMemo(() => items.map(getValue), [items])
    const [currentTabs, setCurrentTabs] = useState(currentTab)
    // If currentTab is invalid, fallback to first tab
    useEffect(() => {
        if (items.length === 0) return
        if (!values.includes(currentTab)) {
            onChange?.(values[0])
        }
    }, [currentTab, values, items.length, onChange])

    const safeCurrentTab = useMemo(() => {
        if (items.length === 0) return ''
        if (onChange) {
            return values.includes(currentTab) ? currentTab : values[0]
        } else {
            return currentTabs
        }
    }, [currentTab, values, items.length, currentTabs])

    const handleOnchange = (v: string) => {
        if (onChange) onChange?.(v)
        else setCurrentTabs(v)
    }

    if (items.length === 0) return null

    return (
        <>
            <Tabs value={safeCurrentTab} onChange={handleOnchange}>
                <TabList className={classNames('flex', disposition)}>
                    {items.map((tab, index) => {
                        const value = getValue(tab, index)
                        return (
                            <TabNav
                                key={value}
                                value={value}
                                icon={tab.icon}
                                title={tab.title}
                            >
                                {tab.label}
                            </TabNav>
                        )
                    })}
                </TabList>

                <div className="p-4">
                    {items.map((tab, index) => {
                        const value = getValue(tab, index)
                        return (
                            <TabContent key={value} value={value}>
                                {tab.content}
                            </TabContent>
                        )
                    })}
                </div>
            </Tabs>
        </>
    )
}

export default DambaTabs

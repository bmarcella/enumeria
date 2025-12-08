import { ServiceProvider } from '@/providers/ServiceProvider'
import { fetchServicesByModuleId } from '@/services/module'
import ServiceView from './ServiceView'
import DambaTabs, { DambaTabItem } from '../components/Layout/DambaTabs'
import { useEffect, useMemo, useState } from 'react'
import { useModuleStore } from '@/stores/useModuleStore'
import { HiOutlineCog, HiOutlineCube, HiOutlineMenuAlt2 } from 'react-icons/hi'
import ModulesView from './ModulesView'

function AppView() {
    const module = useModuleStore((s) => s.module)
    const [currentTab, setCurrentTab] = useState('')

    const tabs: DambaTabItem[] = useMemo(
        () => [
            {
                value: module?.name || 'Module',
                icon: <HiOutlineCube />,
                label: module?.name || 'Module',
                title: module?.name || 'Module',
                content: (
                    <ServiceProvider
                        fetchServicesByModuleId={fetchServicesByModuleId}
                    >
                        <ServiceView />
                    </ServiceProvider>
                ),
            },
            {
                value: 'Modules',
                icon: <HiOutlineMenuAlt2 />,
                content: <ModulesView goTo={setCurrentTab}></ModulesView>,
            },
            {
                value: 'Setting',
                icon: <HiOutlineCog />,
                content: (
                    <div>
                        <h1>Setting</h1>
                    </div>
                ),
            },
        ],
        [module, fetchServicesByModuleId, setCurrentTab],
    )

    useEffect(() => {
        if (tabs.length === 0) return
        const exists = tabs.some((t) => (t.value ?? t.title) === currentTab)
        if (!currentTab || !exists) {
            setCurrentTab(
                tabs[0]?.value || tabs[0]?.title || module?.name || 'Module',
            )
        }
    }, [tabs, currentTab])
    return (
        <>
            <DambaTabs
                items={tabs}
                currentTab={currentTab}
                onChange={setCurrentTab}
            />
        </>
    )
}

export default AppView

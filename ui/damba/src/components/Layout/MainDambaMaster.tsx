import { ReactNode, useMemo, useState } from 'react'
import SidebarDamba, { SidebarItem } from './SideBarDambaPure'
import MainDamba from './MainDamba'

interface Props {
    sidebars?: { 
        items: SidebarItem[];
        initialDefaultKey: string;
        MenuKeys: Record<string, string>;
        storeKeyName: string;
    };
    content?: ReactNode | ((key: string, setKey: (k: string) => void) => ReactNode);
}

const MainDambaMaster = ({ sidebars, content }: Props) => {
    
    const validKeys = useMemo(() => {
        if (!sidebars) return new Set<string>();
        return new Set<string>([
            sidebars.initialDefaultKey,
            ...Object.values(sidebars.MenuKeys),
        ]);
    }, [sidebars]);

    const [activeKey, setActiveKey] = useState<string>(() => {
        if (!sidebars) return '';
        if (typeof window === 'undefined') return sidebars.initialDefaultKey;
        const saved = window.localStorage.getItem(sidebars.storeKeyName);
        return saved && validKeys.has(saved) ? saved : sidebars.initialDefaultKey;
    });

    const handleSelect = (key: string) => {
        setActiveKey(key);
        if (sidebars && typeof window !== 'undefined') {
            window.localStorage.setItem(sidebars.storeKeyName, key);
        }
    };

    const renderContent = () => {
        if (typeof content === 'function') {
            return content(activeKey, handleSelect);
        }
        return content;
    };

    return (
        <MainDamba
            sidebar={
                sidebars ? (
                    <SidebarDamba
                        items={sidebars.items}
                        activeKey={activeKey}
                        onSelect={handleSelect}
                    />
                ) : undefined
            }
            content={renderContent()}
        />
    )
}

export default MainDambaMaster

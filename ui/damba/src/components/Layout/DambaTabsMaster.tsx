import React, { useEffect, useMemo, useState } from 'react'
import DambaTabs, { DambaTabItem } from './DambaTabs'
import { values } from 'lodash'

interface props {
      items: DambaTabItem[] ,
      initialTab: string,
      onChange?: (value: string) => void
}

function DambaTabsMaster({items, initialTab, onChange}: props ) {
    const [currentTab, setCurrentTab] = useState(initialTab)

    const handleOnchange = (v: string) => {
        if (onChange) onChange?.(v)
        else setCurrentTab(v)
    }
    useEffect(() => {
        if (items.length === 0) return
        const exists = items.some((t) => (t.value ?? t.title) === currentTab)
        if (!currentTab || !exists) {
            setCurrentTab(
                items[0]?.value || items[0]?.title || currentTab,
            )
        }
    }, [items, currentTab])

  return (
       <>
            <DambaTabs
                items={items}
                currentTab={currentTab}
                onChange={handleOnchange}
            />
        </>
  )
}

export default DambaTabsMaster


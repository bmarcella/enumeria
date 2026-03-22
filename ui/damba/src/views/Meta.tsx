import { Card, Tag } from '@/components/ui'
import { useSessionUser } from '@/stores/authStore'
import { useAppServiceStore } from '@/stores/ServiceStore'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { useModuleStore } from '@/stores/useModuleStore'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'

function Meta() {
    const module = useModuleStore((s) => s.module)
    const service = useAppServiceStore((s) => s.service)
    const app = useApplicationStore((s) => s.cApp)
    const user = useSessionUser((state) => state.user)
    const { t } = useTranslation()
    const items = [
        user?.currentSetting?.env
            ? { label: t(user.currentSetting?.env) }
            : null,
        app?.name ? { label: app.name } : null,
        module?.name ? { label: module.name } : null,
        service?.name ? { label: service.name } : null,
    ].filter(Boolean) as { label: string }[]

    if (items.length === 0) return null

    return (
        <Card className="mb-2">
            <div className="flex flex-wrap items-center gap-1 text-sm">
                {items.map((item, idx) => (
                    <React.Fragment key={`${item.label}-${idx}`}>
                        {idx == 0 && (
                            <Tag className="bg-green-100 text-green-700 border border-green-200">
                                {item.label}
                            </Tag>
                        )}
                        {idx != 0 && (
                            <span
                                className={classNames(
                                    idx == items.length - 1
                                        ? 'font-bold text-gray-900 dark:text-gray-100'
                                        : 'text-gray-500',
                                )}
                            >
                                {item.label}
                            </span>
                        )}
                        {idx < items.length - 1 && idx != 0 && (
                            <span className="text-gray-400">{'>'}</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </Card>
    )
}

export default Meta

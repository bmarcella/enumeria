/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useApplicationStore } from '@/stores/useApplicationStore'
import { fetchAppTree } from '@/services/Application'
import AppTreeExplorer, { type AppTreeNode } from './AppTreeExplorer'
import ModulePanel from './panels/ModulePanel'
import ServicePanel from './panels/ServicePanel'
import BehaviorChainPanel from './panels/BehaviorChainPanel'
import BehaviorPanel from './panels/BehaviorPanel'
import CodeEditorPanel from './panels/CodeEditorPanel'
import ExtraPanel from './panels/ExtraPanel'
import { HiOutlineViewGrid } from 'react-icons/hi'

// ── Transform API data → tree nodes ────────────────────────────────────────

function buildTree(modules: any[]): AppTreeNode[] {
    return modules.map((mod) => {
        const serviceNodes: AppTreeNode[] = (mod.services ?? []).map(
            (svc: any) => {
                // Behavior chains → behaviors → hooks
                const chainNodes: AppTreeNode[] = (
                    svc.behaviorChains ?? []
                ).map((chain: any) => {
                    const behaviorNodes: AppTreeNode[] = (
                        chain.behaviors ?? []
                    ).map((beh: any) => {
                        const hookNodes: AppTreeNode[] = (
                            beh.hooks ?? []
                        ).map((hook: any) => ({
                            id: hook.id,
                            name: `${hook.method}`,
                            type: 'behavior-hook' as const,
                            data: { ...hook, behaviorPath: beh.path },
                        }))

                        return {
                            id: beh.id,
                            name: beh.path || beh.name,
                            type: 'behavior' as const,
                            data: beh,
                            children: hookNodes,
                        }
                    })

                    return {
                        id: chain.id,
                        name: chain.name,
                        type: 'behavior-chain' as const,
                        data: chain,
                        children: behaviorNodes,
                    }
                })

                // Extras → extra hooks
                const extraNodes: AppTreeNode[] = (svc.extras ?? []).map(
                    (extra: any) => {
                        const hookNodes: AppTreeNode[] = (
                            extra.extra_hooks ?? []
                        ).map((hook: any) => ({
                            id: hook.id,
                            name: `${hook.name}.ts`,
                            type: 'extra-hook' as const,
                            data: hook,
                        }))

                        return {
                            id: extra.id,
                            name: extra.name,
                            type: 'extra' as const,
                            data: extra,
                            children: hookNodes,
                        }
                    },
                )

                const children: AppTreeNode[] = []

                if (chainNodes.length > 0) {
                    children.push({
                        id: `${svc.id}__behaviors`,
                        name: 'Behaviors',
                        type: 'behavior-chains-group',
                        children: chainNodes,
                    })
                }

                if (extraNodes.length > 0) {
                    children.push({
                        id: `${svc.id}__extras`,
                        name: 'Extras',
                        type: 'extras-group',
                        children: extraNodes,
                    })
                }

                return {
                    id: svc.id,
                    name: svc.name ?? 'Unnamed Service',
                    type: 'service' as const,
                    data: svc,
                    children,
                }
            },
        )

        // Module index file (auto-generated)
        const indexNode: AppTreeNode = {
            id: `${mod.id}__index`,
            name: 'index.ts',
            type: 'module-index',
            readOnly: true,
            data: mod,
        }

        return {
            id: mod.id,
            name: mod.name ?? 'Unnamed Module',
            type: 'module' as const,
            data: mod,
            children: [indexNode, ...serviceNodes],
        }
    })
}

// ── Flatten tree for lookup ─────────────────────────────────────────────────

function flattenTree(nodes: AppTreeNode[]): Map<string, AppTreeNode> {
    const map = new Map<string, AppTreeNode>()
    const walk = (list: AppTreeNode[]) => {
        for (const node of list) {
            map.set(node.id, node)
            if (node.children) walk(node.children)
        }
    }
    walk(nodes)
    return map
}

// ── Hook ────────────────────────────────────────────────────────────────────

const useBackendAppView = () => {
    const cApp = useApplicationStore((s) => s.cApp)
    const [rawModules, setRawModules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | undefined>()

    // Fetch tree
    useEffect(() => {
        const appId = cApp?.id
        if (!appId) {
            setLoading(false)
            return
        }

        let cancelled = false
        setLoading(true)

        fetchAppTree(appId)
            .then((res: any) => {
                if (cancelled) return
                const data = res?.data ?? res ?? []
                setRawModules(Array.isArray(data) ? data : [])
            })
            .catch((err: any) => {
                console.error('Failed to fetch app tree:', err)
                if (!cancelled) setRawModules([])
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [cApp?.id])

    const tree = useMemo(() => buildTree(rawModules), [rawModules])
    const nodeMap = useMemo(() => flattenTree(tree), [tree])
    const selectedNode = selectedId ? nodeMap.get(selectedId) : undefined

    const handleSelect = useCallback((node: AppTreeNode) => {
        setSelectedId(node.id)
    }, [])

    // ── Right panel content ─────────────────────────────────────────────────
    const renderPanel = () => {
        if (!selectedNode) {
            return (
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <HiOutlineViewGrid className="text-4xl text-gray-700 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                            Select an item from the tree
                        </p>
                        <p className="text-xs text-gray-700 mt-1">
                            Browse modules, services, behaviors, and extras
                        </p>
                    </div>
                </div>
            )
        }

        switch (selectedNode.type) {
            case 'module':
            case 'module-index':
                return <ModulePanel data={selectedNode.data} />
            case 'service':
                return <ServicePanel data={selectedNode.data} />
            case 'behavior-chain':
                return <BehaviorChainPanel data={selectedNode.data} />
            case 'behavior':
                return <BehaviorPanel data={selectedNode.data} />
            case 'behavior-hook':
                return (
                    <CodeEditorPanel
                        data={selectedNode.data}
                        kind="behavior-hook"
                    />
                )
            case 'extra':
                return <ExtraPanel data={selectedNode.data} />
            case 'extra-hook':
                return (
                    <CodeEditorPanel
                        data={selectedNode.data}
                        kind="extra-hook"
                    />
                )
            case 'behavior-chains-group':
            case 'extras-group':
                return (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-sm text-gray-500">
                            Expand to browse items
                        </p>
                    </div>
                )
            default:
                return null
        }
    }

    return { tree, loading, selectedId, handleSelect, renderPanel }
}

export default useBackendAppView

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    NodeTypes,
    MarkerType,
    BackgroundVariant,
    ReactFlowProvider,
    useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { HiOutlineTable } from 'react-icons/hi'
import EntityNode, { EntityNodeData } from './components/EntityNode'
import EntityInspector from './components/EntityInspector'
import { v4 as uuidv4 } from 'uuid'
import {
    fetchDataModelEntities,
    createDataModelEntity,
    updateDataModelEntity,
    deleteDataModelEntity,
    createColumn as apiCreateColumn,
    updateColumn as apiUpdateColumn,
    deleteColumn as apiDeleteColumn,
    fetchRelationships,
    createRelationship as apiCreateRelationship,
    updateRelationship as apiUpdateRelationship,
    deleteRelationship as apiDeleteRelationship,
} from '@/services/DataModeler'
import { useOrganizationId } from '@/utils/hooks/useOrganization'
import { useManualPipelineStore } from '@/stores/useManualPipelineStore'

const nodeTypes: NodeTypes = {
    entity: EntityNode,
}

export type DataModelerProps = {
    initialEntities?: Array<{
        id?: string
        entityName?: string
        name?: string
        description?: string
        stereotype?: string
        attributes?: Array<{
            id?: string
            name: string
            type: string
            required?: boolean
            nullable?: boolean
            isId?: boolean
            unique?: boolean
            relation?: {
                type: string
                targetEntity: string
            } | null
        }>
        _raw?: any
    }>
    readOnly?: boolean
}

/* ── helpers to map API responses to ReactFlow ── */

function mapApiEntitiesToNodes(entities: any[]): Node<EntityNodeData>[] {
    if (!entities?.length) return []
    const cols = 3
    const xGap = 320
    const yGap = 280

    return entities.map((ent, idx) => {
        const columns = (ent.columns ?? []).map((c: any, ci: number) => ({
            id: c.id,
            name: c.name,
            dataType: (c.dataType ?? 'VARCHAR').toUpperCase(),
            isPrimaryKey: !!c.isPrimaryKey,
            isForeignKey: !!c.isForeignKey,
            isNotNull: !!c.isNotNull,
            isUnique: !!c.isUnique,
            isArray: !!c.isArray,
            defaultValue: c.defaultValue,
            enumValues: c.enumValues,
            ordinal: c.ordinal ?? ci,
        }))

        return {
            id: ent.id,
            type: 'entity' as const,
            position: {
                x: ent.positionX ?? (idx % cols) * xGap + 80,
                y: ent.positionY ?? Math.floor(idx / cols) * yGap + 80,
            },
            data: {
                label: ent.name,
                isAbstract: ent.isAbstract,
                parentEntity: ent.parentEntityId ?? undefined,
                columns,
            },
        }
    })
}

function mapApiRelationshipsToEdges(
    rels: any[],
    nodes: Node<EntityNodeData>[],
): { edges: any[]; nodeUpdates: Map<string, { colId: string; edgeId: string; refEntity: string; refCol?: string; relType: string }[]> } {
    const edges: any[] = []
    const nodeUpdates = new Map<string, { colId: string; edgeId: string; refEntity: string; refCol?: string; relType: string }[]>()

    for (const rel of rels) {
        const sourceId = rel.fromEntityId
        const targetId = rel.toEntityId
        const edgeId = `rel-${rel.id}`

        edges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            type: 'smoothstep',
            animated: true,
            label: rel.type ?? '1:N',
            data: { relationshipId: rel.id },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
            style: { stroke: '#6366f1', strokeWidth: 2 },
            labelStyle: { fill: '#94a3b8', fontSize: 11, fontWeight: 700 },
            labelBgStyle: { fill: '#1e293b', fillOpacity: 0.9 },
            labelBgPadding: [6, 3] as [number, number],
            labelBgBorderRadius: 4,
        })

        // Mark the FK column on the source node
        if (rel.fkColumnId) {
            const existing = nodeUpdates.get(sourceId) ?? []
            const targetNode = nodes.find((n) => n.id === targetId)
            const targetPk = targetNode?.data.columns.find((c) => c.isPrimaryKey)
            existing.push({
                colId: rel.fkColumnId,
                edgeId,
                refEntity: targetId,
                refCol: targetPk?.id,
                relType: rel.type ?? '1:N',
            })
            nodeUpdates.set(sourceId, existing)
        }
    }

    return { edges, nodeUpdates }
}

function mapInitialEntitiesToNodes(entities: DataModelerProps['initialEntities']): Node<EntityNodeData>[] {
    if (!entities?.length) return []
    const cols = 3
    const xGap = 320
    const yGap = 280

    return entities.map((ent, idx) => {
        const attrs = ent.attributes ?? ent._raw?.attributes ?? []
        const name = ent.entityName ?? ent._raw?.name ?? ent.name ?? 'Entity'
        return {
            id: ent.id ?? uuidv4(),
            type: 'entity' as const,
            position: {
                x: (idx % cols) * xGap + 80,
                y: Math.floor(idx / cols) * yGap + 80,
            },
            data: {
                label: name,
                columns: attrs.map((a: any) => ({
                    id: a.id ?? uuidv4(),
                    name: a.name,
                    dataType: (a.type ?? 'varchar').toUpperCase(),
                    isPrimaryKey: !!a.isId,
                    isForeignKey: !!a.relation,
                    isNotNull: a.required ?? !a.nullable ?? false,
                    isUnique: !!a.unique,
                })),
            },
        }
    })
}

/* ── debounce helper ── */

function useDebouncedCallback<T extends (...args: any[]) => any>(fn: T, delay: number) {
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
    return useCallback(
        (key: string, ...args: Parameters<T>) => {
            const existing = timers.current.get(key)
            if (existing) clearTimeout(existing)
            timers.current.set(
                key,
                setTimeout(() => {
                    timers.current.delete(key)
                    fn(...args)
                }, delay),
            )
        },
        [fn, delay],
    )
}

/* ── main component ── */

const DataModelerViewInner = ({ initialEntities, readOnly }: DataModelerProps) => {
    const orgId = useOrganizationId()
    const projectId = useManualPipelineStore((s) => s.projectId)

    const [nodes, setNodes, onNodesChange] = useNodesState<EntityNodeData>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Track relationship IDs mapped by edgeId for deletion
    const relIdByEdge = useRef<Map<string, string>>(new Map())

    /* ── Load from API on mount ── */
    useEffect(() => {
        if (initialEntities?.length) {
            setNodes(mapInitialEntitiesToNodes(initialEntities))
            setLoading(false)
            return
        }

        if (!orgId || !projectId) {
            setLoading(false)
            return
        }

        const load = async () => {
            try {
                const [entitiesRes, relsRes] = await Promise.all([
                    fetchDataModelEntities(orgId, projectId),
                    fetchRelationships(orgId, projectId),
                ])

                const apiEntities = (entitiesRes as any)?.data ?? entitiesRes ?? []
                const apiRels = (relsRes as any)?.data ?? relsRes ?? []

                const mappedNodes = mapApiEntitiesToNodes(
                    Array.isArray(apiEntities) ? apiEntities : [],
                )
                const { edges: mappedEdges, nodeUpdates } = mapApiRelationshipsToEdges(
                    Array.isArray(apiRels) ? apiRels : [],
                    mappedNodes,
                )

                // Annotate FK columns with edge/ref info
                for (const [nodeId, updates] of nodeUpdates) {
                    const node = mappedNodes.find((n) => n.id === nodeId)
                    if (!node) continue
                    for (const upd of updates) {
                        const col = node.data.columns.find((c) => c.id === upd.colId)
                        if (col) {
                            col.edgeId = upd.edgeId
                            col.referenceEntity = upd.refEntity
                            col.referenceColumn = upd.refCol
                            col.relationType = upd.relType
                        }
                    }
                }

                // Track relationship IDs
                for (const rel of (Array.isArray(apiRels) ? apiRels : [])) {
                    relIdByEdge.current.set(`rel-${rel.id}`, rel.id)
                }

                setNodes(mappedNodes)
                setEdges(mappedEdges)
            } catch (err) {
                console.error('Failed to load data model', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [orgId, projectId])

    const selectedEntity = useMemo(() => {
        if (!selectedEntityId) return null
        const node = nodes.find((n) => n.id === selectedEntityId)
        if (!node) return null
        return {
            id: node.id,
            name: node.data.label,
            isAbstract: node.data.isAbstract,
            parentEntity: node.data.parentEntity,
            columns: node.data.columns || [],
        }
    }, [selectedEntityId, nodes])

    const allEntities = useMemo(
        () =>
            nodes.map((n) => ({
                id: n.id,
                name: n.data.label,
                isAbstract: n.data.isAbstract,
                columns: (n.data.columns || []).map((c) => ({
                    id: c.id,
                    name: c.name,
                })),
            })),
        [nodes],
    )

    const { setCenter, getViewport } = useReactFlow()
    const entityCounter = useRef(0)

    /* ── Debounced API update helpers ── */

    const debouncedUpdateEntity = useDebouncedCallback(
        (entityId: string, data: any) => {
            updateDataModelEntity(entityId, data).catch((err) =>
                console.error('Failed to update entity', err),
            )
        },
        500,
    )

    const debouncedUpdateColumn = useDebouncedCallback(
        (entityId: string, columnId: string, data: any) => {
            apiUpdateColumn(entityId, columnId, data).catch((err) =>
                console.error('Failed to update column', err),
            )
        },
        500,
    )

    /* ── Node position change → persist ── */

    const handleNodesChange = useCallback(
        (changes: any[]) => {
            onNodesChange(changes)

            for (const change of changes) {
                if (change.type === 'position' && change.dragging === false && change.position) {
                    debouncedUpdateEntity(`pos-${change.id}`, change.id, {
                        positionX: change.position.x,
                        positionY: change.position.y,
                    })
                }
                if (change.type === 'remove') {
                    deleteDataModelEntity(change.id).catch((err) =>
                        console.error('Failed to delete entity', err),
                    )
                }
            }
        },
        [onNodesChange, debouncedUpdateEntity],
    )

    /* ── Add entity ── */

    const handleAddEntity = useCallback(async () => {
        entityCounter.current += 1
        const { x: vx, y: vy, zoom } = getViewport()
        const centerX = -vx / zoom + (window.innerWidth / 2) / zoom
        const centerY = -vy / zoom + (window.innerHeight / 2) / zoom
        const name = `new_table_${entityCounter.current}`

        const defaultColumns = [
            { name: 'id', dataType: 'UUID', isPrimaryKey: true, isNotNull: true, ordinal: 0 },
            { name: 'created_at', dataType: 'TIMESTAMP', isNotNull: true, ordinal: 1 },
            { name: 'updated_at', dataType: 'TIMESTAMP', ordinal: 2 },
        ]

        try {
            const res: any = await createDataModelEntity({
                name,
                isAbstract: false,
                positionX: centerX - 130,
                positionY: centerY - 80,
            })
            const entity = res?.data ?? res
            const entityId = entity?.id

            if (!entityId) {
                console.error('Failed to create entity — no ID returned')
                return
            }

            // Create default columns in parallel
            const colResults = await Promise.all(
                defaultColumns.map((col) => apiCreateColumn(entityId, col)),
            )

            const columns = colResults.map((cr: any, i) => {
                const col = cr?.data ?? cr
                return {
                    id: col?.id ?? uuidv4(),
                    name: defaultColumns[i].name,
                    dataType: defaultColumns[i].dataType,
                    isPrimaryKey: !!defaultColumns[i].isPrimaryKey,
                    isForeignKey: false,
                    isNotNull: !!defaultColumns[i].isNotNull,
                    isUnique: false,
                }
            })

            const newNode: Node<EntityNodeData> = {
                id: entityId,
                type: 'entity',
                position: { x: centerX - 130, y: centerY - 80 },
                selected: true,
                data: { label: name, columns },
            }
            setNodes((nds) => [
                ...nds.map((n) => ({ ...n, selected: false })),
                newNode,
            ])
            setSelectedEntityId(entityId)
            setTimeout(() => {
                setCenter(centerX, centerY, { zoom, duration: 300 })
            }, 50)
        } catch (err) {
            console.error('Failed to create entity', err)
        }
    }, [setNodes, getViewport, setCenter])

    /* ── Update entity ── */

    const handleUpdateEntity = useCallback(
        (
            entityId: string,
            data: Partial<{
                name: string
                isAbstract: boolean
                parentEntity: string | undefined
            }>,
        ) => {
            // When toggling to abstract, remove all FK columns and their edges
            if (data.isAbstract) {
                setNodes((nds) => {
                    const node = nds.find((n) => n.id === entityId)
                    const fkCols = (node?.data.columns || []).filter((c) => c.edgeId)
                    const fkEdgeIds = fkCols.map((c) => c.edgeId!)

                    const incomingEdgeIds: string[] = []
                    const incomingFkColIds: { nodeId: string; colId: string }[] = []
                    for (const n of nds) {
                        if (n.id === entityId) continue
                        for (const c of n.data.columns) {
                            if (c.referenceEntity === entityId && c.edgeId) {
                                incomingEdgeIds.push(c.edgeId)
                                incomingFkColIds.push({ nodeId: n.id, colId: c.id })
                            }
                        }
                    }
                    const allEdgeIds = new Set([...fkEdgeIds, ...incomingEdgeIds])
                    if (allEdgeIds.size > 0) {
                        setEdges((eds) => eds.filter((e) => !allEdgeIds.has(e.id)))
                        // Delete relationships from backend
                        for (const eid of allEdgeIds) {
                            const relId = relIdByEdge.current.get(eid)
                            if (relId) {
                                apiDeleteRelationship(relId).catch(() => {})
                                relIdByEdge.current.delete(eid)
                            }
                        }
                    }

                    // Delete FK columns from backend
                    for (const col of fkCols) {
                        apiDeleteColumn(entityId, col.id).catch(() => {})
                    }
                    for (const { nodeId, colId } of incomingFkColIds) {
                        apiDeleteColumn(nodeId, colId).catch(() => {})
                    }

                    return nds.map((n) => {
                        if (n.id === entityId) {
                            return {
                                ...n,
                                data: {
                                    ...n.data,
                                    label: data.name ?? n.data.label,
                                    isAbstract: true,
                                    parentEntity: n.data.parentEntity,
                                    columns: n.data.columns.filter(
                                        (c) => !c.isForeignKey,
                                    ),
                                },
                            }
                        }
                        if (incomingEdgeIds.length > 0) {
                            return {
                                ...n,
                                data: {
                                    ...n.data,
                                    columns: n.data.columns.filter(
                                        (c) =>
                                            !(
                                                c.referenceEntity === entityId &&
                                                c.isForeignKey
                                            ),
                                    ),
                                },
                            }
                        }
                        return n
                    })
                })

                debouncedUpdateEntity(`ent-${entityId}`, entityId, {
                    name: data.name,
                    isAbstract: true,
                })
                return
            }

            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id !== entityId) return n
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            label: data.name ?? n.data.label,
                            ...('isAbstract' in data
                                ? { isAbstract: data.isAbstract }
                                : {}),
                            ...('parentEntity' in data
                                ? { parentEntity: data.parentEntity }
                                : {}),
                        },
                    }
                }),
            )

            const apiData: any = {}
            if (data.name !== undefined) apiData.name = data.name
            if ('isAbstract' in data) apiData.isAbstract = data.isAbstract
            if ('parentEntity' in data) apiData.parentEntityId = data.parentEntity ?? null
            debouncedUpdateEntity(`ent-${entityId}`, entityId, apiData)
        },
        [setNodes, setEdges, debouncedUpdateEntity],
    )

    /* ── Add column ── */

    const handleAddColumn = useCallback(
        async (entityId: string, column: any) => {
            const tempId = uuidv4()
            const newCol = { ...column, id: tempId }

            // Optimistic local update
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === entityId
                        ? {
                              ...n,
                              data: {
                                  ...n.data,
                                  columns: [...(n.data.columns || []), newCol],
                              },
                          }
                        : n,
                ),
            )

            try {
                const res: any = await apiCreateColumn(entityId, {
                    name: column.name,
                    dataType: column.dataType,
                    isPrimaryKey: column.isPrimaryKey ?? false,
                    isForeignKey: column.isForeignKey ?? false,
                    isNotNull: column.isNotNull ?? false,
                    isUnique: column.isUnique ?? false,
                    ordinal: column.ordinal,
                })
                const saved = res?.data ?? res
                if (saved?.id && saved.id !== tempId) {
                    // Replace temp ID with real ID
                    setNodes((nds) =>
                        nds.map((n) =>
                            n.id === entityId
                                ? {
                                      ...n,
                                      data: {
                                          ...n.data,
                                          columns: n.data.columns.map((c) =>
                                              c.id === tempId
                                                  ? { ...c, id: saved.id }
                                                  : c,
                                          ),
                                      },
                                  }
                                : n,
                        ),
                    )
                }
            } catch (err) {
                console.error('Failed to create column', err)
            }
        },
        [setNodes],
    )

    /* ── Update column ── */

    const handleUpdateColumn = useCallback(
        (entityId: string, columnId: string, data: any) => {
            setNodes((nds) => {
                if (data.relationType) {
                    const node = nds.find((n) => n.id === entityId)
                    const col = node?.data.columns.find(
                        (c: any) => c.id === columnId,
                    )
                    if (col?.edgeId) {
                        setEdges((eds) =>
                            eds.map((e) =>
                                e.id === col.edgeId
                                    ? { ...e, label: data.relationType }
                                    : e,
                            ),
                        )
                        // Update relationship type on backend
                        const relId = relIdByEdge.current.get(col.edgeId)
                        if (relId) {
                            apiUpdateRelationship(relId, { type: data.relationType }).catch(
                                (err) => console.error('Failed to update relationship type', err),
                            )
                        }
                    }
                }

                return nds.map((n) => {
                    if (n.id !== entityId) return n
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            columns: n.data.columns.map((c: any) =>
                                c.id === columnId ? { ...c, ...data } : c,
                            ),
                        },
                    }
                })
            })

            // Persist to API (debounced)
            const apiData: any = { ...data }
            // Remove frontend-only fields
            delete apiData.edgeId
            delete apiData.referenceEntity
            delete apiData.referenceColumn
            delete apiData.relationType
            if (Object.keys(apiData).length > 0) {
                debouncedUpdateColumn(`col-${columnId}`, entityId, columnId, apiData)
            }
        },
        [setNodes, setEdges, debouncedUpdateColumn],
    )

    /* ── Delete column ── */

    const handleDeleteColumn = useCallback(
        (entityId: string, columnId: string) => {
            const node = nodes.find((n) => n.id === entityId)
            const col = node?.data.columns.find((c) => c.id === columnId)
            if (col?.edgeId) {
                setEdges((eds) => eds.filter((e) => e.id !== col.edgeId))
                const relId = relIdByEdge.current.get(col.edgeId)
                if (relId) {
                    apiDeleteRelationship(relId).catch(() => {})
                    relIdByEdge.current.delete(col.edgeId)
                }
            }

            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id !== entityId) return n
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            columns: n.data.columns.filter(
                                (c: any) => c.id !== columnId,
                            ),
                        },
                    }
                }),
            )

            apiDeleteColumn(entityId, columnId).catch((err) =>
                console.error('Failed to delete column', err),
            )
        },
        [setNodes, setEdges, nodes],
    )

    /* ── Connect (create relationship) ── */

    const onConnect = useCallback(
        async (connection: Connection) => {
            if (!connection.source || !connection.target) return
            const sourceId = connection.source
            const targetId = connection.target

            const sourceNode = nodes.find((n) => n.id === sourceId)
            const targetNode = nodes.find((n) => n.id === targetId)
            if (!targetNode) return
            if (sourceNode?.data.isAbstract || targetNode.data.isAbstract) return

            const targetName = targetNode.data.label
            const targetPk = targetNode.data.columns.find(
                (c) => c.isPrimaryKey,
            )
            const fkColName = `${targetName.toLowerCase()}_id`
            const relationType = '1:N'

            try {
                // Create FK column on backend
                const colRes: any = await apiCreateColumn(sourceId, {
                    name: fkColName,
                    dataType: targetPk?.dataType ?? 'UUID',
                    isForeignKey: true,
                    isNotNull: true,
                })
                const savedCol = colRes?.data ?? colRes
                const fkColId = savedCol?.id ?? uuidv4()

                // Create relationship on backend
                const relRes: any = await apiCreateRelationship({
                    fromEntityId: sourceId,
                    toEntityId: targetId,
                    type: relationType,
                    name: fkColName,
                    fkColumnId: fkColId,
                    orgId,
                    projId: projectId,
                })
                const savedRel = relRes?.data ?? relRes
                const relId = savedRel?.id
                const edgeId = relId ? `rel-${relId}` : `${sourceId}-${targetId}-${fkColId}`

                if (relId) {
                    relIdByEdge.current.set(edgeId, relId)
                }

                // Update local state
                setNodes((nds) =>
                    nds.map((n) => {
                        if (n.id !== sourceId) return n
                        return {
                            ...n,
                            data: {
                                ...n.data,
                                columns: [
                                    ...n.data.columns,
                                    {
                                        id: fkColId,
                                        name: fkColName,
                                        dataType: targetPk?.dataType ?? 'UUID',
                                        isPrimaryKey: false,
                                        isForeignKey: true,
                                        isNotNull: true,
                                        isUnique: false,
                                        referenceEntity: targetId,
                                        referenceColumn: targetPk?.id,
                                        relationType,
                                        edgeId,
                                    },
                                ],
                            },
                        }
                    }),
                )

                setEdges((eds) =>
                    addEdge(
                        {
                            ...connection,
                            id: edgeId,
                            type: 'smoothstep',
                            animated: true,
                            label: relationType,
                            data: { relationshipId: relId },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: '#6366f1',
                            },
                            style: { stroke: '#6366f1', strokeWidth: 2 },
                            labelStyle: {
                                fill: '#94a3b8',
                                fontSize: 11,
                                fontWeight: 700,
                            },
                            labelBgStyle: {
                                fill: '#1e293b',
                                fillOpacity: 0.9,
                            },
                            labelBgPadding: [6, 3] as [number, number],
                            labelBgBorderRadius: 4,
                        },
                        eds,
                    ),
                )
            } catch (err) {
                console.error('Failed to create relationship', err)
            }
        },
        [setEdges, setNodes, nodes, orgId, projectId],
    )

    /* ── Edge removal → delete relationship ── */

    const handleEdgesChange = useCallback(
        (changes: any[]) => {
            const removedEdgeIds = changes
                .filter((c: any) => c.type === 'remove')
                .map((c: any) => c.id)

            if (removedEdgeIds.length > 0) {
                // Delete relationships from backend
                for (const eid of removedEdgeIds) {
                    const relId = relIdByEdge.current.get(eid)
                    if (relId) {
                        apiDeleteRelationship(relId).catch(() => {})
                        relIdByEdge.current.delete(eid)
                    }
                }

                // Clean up FK columns locally (backend cascades from relationship delete)
                setNodes((nds) =>
                    nds.map((n) => ({
                        ...n,
                        data: {
                            ...n.data,
                            columns: n.data.columns.filter(
                                (c) =>
                                    !c.edgeId ||
                                    !removedEdgeIds.includes(c.edgeId),
                            ),
                        },
                    })),
                )
            }

            onEdgesChange(changes)
        },
        [onEdgesChange, setNodes],
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-gray-950">
                <span className="text-sm text-gray-400 animate-pulse">
                    Loading data model...
                </span>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full w-full bg-gray-950">
            {/* Toolbar */}
            <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900/90 backdrop-blur-md shrink-0 z-40">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                        Data Modeler
                    </span>
                    <span className="w-px h-5 bg-gray-800" />
                    <span className="text-xs text-gray-500">
                        {nodes.length} entite(s)
                    </span>
                    <span className="text-xs text-gray-600">|</span>
                    <span className="text-xs text-gray-500">
                        {edges.length} relation(s)
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {!readOnly && (
                        <button
                            onClick={handleAddEntity}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
                        >
                            <HiOutlineTable className="text-sm" /> Entite
                        </button>
                    )}
                </div>
            </div>

            {/* Canvas + Inspector */}
            <div className="flex flex-1 min-h-0">
                {/* Canvas */}
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={handleEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={(_, node) =>
                            setSelectedEntityId(node.id)
                        }
                        onPaneClick={() => setSelectedEntityId(null)}
                        nodeTypes={nodeTypes}
                        fitView
                        className="!bg-[#0b0f1a]"
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={40}
                            size={1.5}
                            color="#6366f1"
                            style={{ opacity: 0.1 }}
                        />
                        <Controls className="!bg-gray-800 !border-gray-700 !shadow-2xl [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-400 [&>button:hover]:!bg-gray-700" />
                        <MiniMap
                            nodeStrokeWidth={3}
                            nodeColor="#6366f1"
                            maskColor="rgba(11, 15, 26, 0.85)"
                            className="!bg-gray-900 !border-gray-800"
                        />
                    </ReactFlow>
                </div>

                {/* Inspector */}
                <aside
                    className={`border-l border-gray-800 bg-[#0b0f1a] flex flex-col shadow-2xl shrink-0 transition-all duration-300 h-full overflow-hidden ${
                        selectedEntityId ? 'w-80' : 'w-0'
                    }`}
                >
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/40 shrink-0">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                            Inspecteur
                        </h3>
                        {selectedEntityId && (
                            <button
                                onClick={() => setSelectedEntityId(null)}
                                className="text-gray-500 hover:text-white text-xs"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <EntityInspector
                            entity={selectedEntity}
                            allEntities={allEntities}
                            onUpdateEntity={handleUpdateEntity}
                            onAddColumn={handleAddColumn}
                            onUpdateColumn={handleUpdateColumn}
                            onDeleteColumn={handleDeleteColumn}
                        />
                    </div>
                </aside>
            </div>
        </div>
    )
}

const DataModelerView = (props: DataModelerProps) => (
    <ReactFlowProvider>
        <DataModelerViewInner {...props} />
    </ReactFlowProvider>
)

export default DataModelerView

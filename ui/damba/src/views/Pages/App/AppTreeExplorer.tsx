/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import {
    HiOutlineChevronRight,
    HiOutlineChevronDown,
    HiOutlineCube,
    HiOutlineDocument,
    HiOutlineCollection,
    HiOutlineLink,
    HiOutlinePuzzle,
    HiOutlineCode,
    HiOutlineLockClosed,
} from 'react-icons/hi'
import classNames from 'classnames'

// ── Node types ──────────────────────────────────────────────────────────────

export type AppTreeNodeType =
    | 'module'
    | 'module-index'
    | 'service'
    | 'behavior-chains-group'
    | 'behavior-chain'
    | 'behavior'
    | 'behavior-hook'
    | 'extras-group'
    | 'extra'
    | 'extra-hook'

export type AppTreeNode = {
    id: string
    name: string
    type: AppTreeNodeType
    children?: AppTreeNode[]
    data?: any
    readOnly?: boolean
}

type Props = {
    tree: AppTreeNode[]
    selectedId?: string
    onSelect?: (node: AppTreeNode) => void
}

// ── HTTP method badge ───────────────────────────────────────────────────────

const methodColors: Record<string, string> = {
    GET: 'text-emerald-400',
    POST: 'text-amber-400',
    PUT: 'text-blue-400',
    PATCH: 'text-purple-400',
    DELETE: 'text-red-400',
}

// ── Icon per node type ──────────────────────────────────────────────────────

const nodeIcon = (type: AppTreeNodeType, data?: any) => {
    switch (type) {
        case 'module':
            return <HiOutlineCube className="text-[#fb732c]" />
        case 'module-index':
            return <HiOutlineLockClosed className="text-gray-500" />
        case 'service':
            return <HiOutlineCollection className="text-blue-400" />
        case 'behavior-chains-group':
            return <HiOutlineLink className="text-gray-500" />
        case 'behavior-chain':
            return <HiOutlineLink className="text-cyan-400" />
        case 'behavior':
            return <HiOutlineCode className="text-green-400" />
        case 'behavior-hook': {
            const method = data?.method ?? ''
            return (
                <span
                    className={classNames(
                        'text-[9px] font-bold tracking-tight',
                        methodColors[method] ?? 'text-gray-400',
                    )}
                >
                    {method}
                </span>
            )
        }
        case 'extras-group':
            return <HiOutlinePuzzle className="text-gray-500" />
        case 'extra':
            return <HiOutlinePuzzle className="text-violet-400" />
        case 'extra-hook':
            return <HiOutlineDocument className="text-violet-300" />
        default:
            return <HiOutlineDocument className="text-gray-500" />
    }
}

const isFolder = (type: AppTreeNodeType) =>
    [
        'module',
        'service',
        'behavior-chains-group',
        'behavior-chain',
        'behavior',
        'extras-group',
        'extra',
    ].includes(type)

// ── Tree Node ───────────────────────────────────────────────────────────────

const TreeNode = ({
    node,
    depth,
    selectedId,
    onSelect,
}: {
    node: AppTreeNode
    depth: number
    selectedId?: string
    onSelect?: (node: AppTreeNode) => void
}) => {
    const [expanded, setExpanded] = useState(depth < 2)
    const folder = isFolder(node.type)
    const isSelected = node.id === selectedId
    const hasChildren = folder && node.children && node.children.length > 0

    return (
        <div>
            <button
                onClick={() => {
                    if (folder) setExpanded(!expanded)
                    onSelect?.(node)
                }}
                className={classNames(
                    'w-full flex items-center gap-1.5 py-[5px] px-2 text-left text-xs transition-colors rounded-sm group',
                    isSelected
                        ? 'bg-[#1f6feb]/20 text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]',
                )}
                style={{ paddingLeft: `${depth * 14 + 8}px` }}
            >
                {/* Chevron */}
                {folder ? (
                    expanded ? (
                        <HiOutlineChevronDown className="text-[10px] text-gray-600 shrink-0" />
                    ) : (
                        <HiOutlineChevronRight className="text-[10px] text-gray-600 shrink-0" />
                    )
                ) : (
                    <span className="w-[10px] shrink-0" />
                )}

                {/* Icon */}
                <span className="text-sm shrink-0 flex items-center justify-center w-4">
                    {nodeIcon(node.type, node.data)}
                </span>

                {/* Name */}
                <span className="truncate">{node.name}</span>

                {/* Badges */}
                {node.readOnly && (
                    <span className="ml-auto text-[9px] text-gray-600 bg-gray-800 px-1 rounded">
                        auto
                    </span>
                )}
            </button>

            {folder && expanded && hasChildren && (
                <div>
                    {node.children!.map((child) => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            depth={depth + 1}
                            selectedId={selectedId}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Explorer ────────────────────────────────────────────────────────────────

const AppTreeExplorer = ({ tree, selectedId, onSelect }: Props) => {
    if (!tree.length) {
        return (
            <div className="p-4 text-center text-xs text-gray-600">
                No modules yet
            </div>
        )
    }

    return (
        <div className="py-1">
            {tree.map((node) => (
                <TreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    selectedId={selectedId}
                    onSelect={onSelect}
                />
            ))}
        </div>
    )
}

export default AppTreeExplorer

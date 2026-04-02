/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import {
    HiOutlineChevronRight,
    HiOutlineChevronDown,
    HiOutlineFolder,
    HiOutlineFolderOpen,
    HiOutlineDocument,
    HiOutlineDatabase,
    HiOutlineCube,
    HiOutlineShieldCheck,
} from 'react-icons/hi'
import classNames from 'classnames'

export type FileNode = {
    id: string
    name: string
    type: 'folder' | 'file'
    icon?: 'entity' | 'service' | 'behavior' | 'policy' | 'module' | 'config'
    children?: FileNode[]
    data?: any
}

type Props = {
    tree: FileNode[]
    selectedId?: string
    onSelect?: (node: FileNode) => void
}

const iconMap: Record<string, any> = {
    entity: <HiOutlineDatabase className="text-purple-400" />,
    service: <HiOutlineCube className="text-blue-400" />,
    behavior: <HiOutlineDocument className="text-green-400" />,
    policy: <HiOutlineShieldCheck className="text-amber-400" />,
    module: <HiOutlineFolder className="text-[#fb732c]" />,
    config: <HiOutlineDocument className="text-gray-500" />,
}

const TreeNode = ({ node, depth, selectedId, onSelect }: {
    node: FileNode
    depth: number
    selectedId?: string
    onSelect?: (node: FileNode) => void
}) => {
    const [expanded, setExpanded] = useState(depth < 2)
    const isFolder = node.type === 'folder'
    const isSelected = node.id === selectedId
    const hasChildren = isFolder && node.children && node.children.length > 0
    const icon = node.icon ? iconMap[node.icon] : null

    return (
        <div>
            <button
                onClick={() => {
                    if (isFolder) setExpanded(!expanded)
                    onSelect?.(node)
                }}
                className={classNames(
                    'w-full flex items-center gap-1 py-1 px-2 text-left text-xs transition-colors rounded-sm',
                    isSelected
                        ? 'bg-[#1f6feb]/20 text-white'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-[#161b22]',
                )}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                {isFolder ? (
                    <>
                        {expanded ? (
                            <HiOutlineChevronDown className="text-[10px] text-gray-600 shrink-0" />
                        ) : (
                            <HiOutlineChevronRight className="text-[10px] text-gray-600 shrink-0" />
                        )}
                        {expanded ? (
                            <HiOutlineFolderOpen className="text-sm text-[#fb732c] shrink-0" />
                        ) : (
                            icon ?? <HiOutlineFolder className="text-sm text-gray-500 shrink-0" />
                        )}
                    </>
                ) : (
                    <>
                        <span className="w-[10px]" />
                        {icon ?? <HiOutlineDocument className="text-sm text-gray-500 shrink-0" />}
                    </>
                )}
                <span className="truncate">{node.name}</span>
            </button>

            {isFolder && expanded && hasChildren && (
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

const FileExplorer = ({ tree, selectedId, onSelect }: Props) => {
    if (!tree.length) {
        return (
            <div className="p-4 text-center text-xs text-gray-600">
                No files yet
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

export default FileExplorer

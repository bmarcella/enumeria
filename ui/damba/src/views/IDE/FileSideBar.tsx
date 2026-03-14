import React, { useMemo, useState } from 'react'
import { buildTree, TreeNode } from './SideBarHelper'

interface Props {
  fileList: string[]
  active: string
  setActive: (p: string) => void
  fileLang: (p: string) => string
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <span className="inline-flex w-4 justify-center text-slate-500">
      {open ? '▾' : '▸'}
    </span>
  )
}

export function FileTreeSidebar({
  fileList,
  active,
  setActive,
  fileLang,
} : Props ) {
  const tree = useMemo(() => buildTree(fileList), [fileList])

  // expand state: store folder paths
  const [openDirs, setOpenDirs] = useState<Set<string>>(() => new Set(['src']))

  const toggleDir = (path: string) => {
    setOpenDirs((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const Row = ({
    children,
    depth,
  }: {
    children: React.ReactNode
    depth: number
  }) => (
    <div style={{ paddingLeft: depth * 12 }} className="min-w-0">
      {children}
    </div>
  )

  const renderNodes = (nodes: TreeNode[], depth = 0) =>
    nodes.map((node) => {
      if (node.type === 'dir') {
        const open = openDirs.has(node.path) || node.path === ''
        return (
          <div key={node.path} className="mb-1">
            <Row depth={depth}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => toggleDir(node.path)}
                title={node.path}
              >
                <FolderIcon open={open} />
                <span className="truncate font-medium">{node.name}</span>
              </button>
            </Row>

            {open ? (
              <div>{renderNodes(node.children, depth + 1)}</div>
            ) : null}
          </div>
        )
      }

      // file
      const isActive = node.path === active
      return (
        <div key={node.path} className="mb-1">
          <Row depth={depth}>
            <button
              type="button"
              className={[
                'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm',
                isActive
                  ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200'
                  : 'text-slate-700 hover:bg-slate-50',
              ].join(' ')}
              onClick={() => setActive(node.path)}
              title={node.path}
            >
              <span className="truncate">{node.name}</span>
              <span className="shrink-0 text-xs text-slate-500">
                {fileLang(node.path)}
              </span>
            </button>
          </Row>
        </div>
      )
    })

  return (
    <aside className="w-1/4 min-w-[200px] max-w-[300px] shrink-0 border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">
        Files
      </div>

      <div className="h-[calc(100%-49px)] overflow-auto p-2">
        {renderNodes(tree)}
      </div>
    </aside>
  )
}

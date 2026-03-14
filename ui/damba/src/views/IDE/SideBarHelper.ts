export type TreeNode =
  | { type: 'dir'; name: string; path: string; children: TreeNode[] }
  | { type: 'file'; name: string; path: string }

export function buildTree(paths: string[]): TreeNode[] {
  const root: { type: 'dir'; name: string; path: string; children: TreeNode[] } =
    { type: 'dir', name: '', path: '', children: [] }

  const getOrCreateDir = (parent: TreeNode[], name: string, path: string) => {
    let dir = parent.find(
      (n) => n.type === 'dir' && n.name === name
    ) as TreeNode | undefined

    if (!dir) {
      dir = { type: 'dir', name, path, children: [] }
      parent.push(dir)
    }
    return dir as Extract<TreeNode, { type: 'dir' }>
  }

  for (const fullPath of paths) {
    const parts = fullPath.split('/').filter(Boolean)
    let cursor = root.children
    let accPath = ''

    parts.forEach((part, idx) => {
      const isLast = idx === parts.length - 1
      accPath = accPath ? `${accPath}/${part}` : part

      if (isLast) {
        cursor.push({ type: 'file', name: part, path: accPath })
      } else {
        const dir = getOrCreateDir(cursor, part, accPath)
        cursor = dir.children
      }
    })
  }

   const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    for (const n of nodes) if (n.type === 'dir') sortNodes(n.children)
  }

  sortNodes(root.children)
  return root.children
}

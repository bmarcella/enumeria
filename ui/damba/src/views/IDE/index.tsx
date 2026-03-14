import { useEffect, useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import { baseName, fileLang, FileMap, pickInitial, ServerFile, serverFilesToFileMap } from './fileHelper'
import { FileTreeSidebar } from './FileSideBar'
import { ChatAi } from './ChatAI'

interface Props {
  serverFiles: ServerFile[]
}


export default function IDE({ serverFiles }: Props) {
  const [files, setFiles] = useState<FileMap>({})
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [active, setActive] = useState<string>('')

  // load files from server
  useEffect(() => {
    if (!serverFiles?.length) {
      setFiles({})
      setOpenTabs([])
      setActive('')
      return
    }

    const map = serverFilesToFileMap(serverFiles)
    const keys = Object.keys(map).sort()
    const first = pickInitial(keys)

    setFiles(map)
    setOpenTabs(first ? [first] : [])
    setActive(first)
  }, [serverFiles])

  const fileList = useMemo(() => Object.keys(files).sort(), [files])

  // open file from sidebar
  const openFile = (path: string) => {
    if (!path) return
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]))
    setActive(path)
  }

  const closeTab = (path: string) => {
    setOpenTabs((prev) => {
      const idx = prev.indexOf(path)
      const next = prev.filter((p) => p !== path)

      // if closing active tab, move focus
      if (path === active) {
        const fallback = next[idx] ?? next[idx - 1] ?? next[0] ?? ''
        setActive(fallback)
      }
      return next
    })
  }

  return (
    <div className=" w-full bg-white text-slate-900">
      <div className="flex h-full min-w-0">
        {/* Sidebar */}
        <FileTreeSidebar
          fileList={fileList}
          active={active}
          setActive={openFile} // IMPORTANT: open tabs on click
          fileLang={fileLang}
        />

        {/* Editor */}
        <section className="flex flex-1 min-w-0 flex-col bg-white">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 px-2 py-1 overflow-x-auto overflow-y-hidden">
            {openTabs.length === 0 ? (
              <div className="px-2 text-xs text-slate-500">No file open</div>
            ) : (
              openTabs.map((p) => {
                const isActive = p === active
                return (
                  <div
                    key={p}
                    className={[
                      'group flex items-center gap-2 rounded-lg border px-2 py-1 text-xs',
                      isActive
                        ? 'border-slate-300 bg-slate-100 text-slate-900'
                        : 'border-transparent bg-white text-slate-600 hover:bg-slate-50',
                    ].join(' ')}
                    title={p}
                  >
                    <button
                      className="truncate max-w-[220px] text-left"
                      onClick={() => setActive(p)}
                      type="button"
                    >
                      {baseName(p)}
                    </button>

                    <button
                      type="button"
                      className={[
                        'ml-1 rounded px-1 text-slate-400 hover:text-slate-700',
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                      ].join(' ')}
                      onClick={() => closeTab(p)}
                      aria-label={`Close ${p}`}
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                )
              })
            )}

            <div className="ml-auto text-xs text-slate-xs shrink-0 pr-2">
              autosave
            </div>
          </div>

          {/* Editor header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4">
            <div className="truncate text-xs font-semibold">{active || 'Select a file'}</div>
            <div className="text-xs text-slate-500">{active ? fileLang(active) : ''}</div>
          </div>

          {/* Monaco */}
          <div className="flex-1 min-w-0">
            <Editor
              theme="light"
              language={fileLang(active)}
              value={active ? files[active] ?? '' : ''}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
              onChange={(v) => {
                if (!active) return
                setFiles((prev) => ({
                  ...prev,
                  [active]: v ?? '',
                }))
              }}
            />
          </div>
        </section>

        {/*ChatAi*/}
        <ChatAi></ChatAi>
      </div>
    </div>
  )
}

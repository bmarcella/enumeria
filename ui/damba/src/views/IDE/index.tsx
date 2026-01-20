import { useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'

type FileMap = Record<string, string>

const initialFiles: FileMap = {
    'index.html': `<!doctype html>
<html>
  <head><meta charset="utf-8" /><title>Demo</title></head>
  <body><h1>Hello</h1></body>
</html>`,
    'src/app.ts': `export const hello = (name: string) => "Hello " + name;`,
    'style.css': `body { font-family: system-ui; }`,
}

function fileLang(path: string) {
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript'
    if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript'
    if (path.endsWith('.css')) return 'css'
    if (path.endsWith('.html')) return 'html'
    if (path.endsWith('.json')) return 'json'
    return 'plaintext'
}

export default function IDE() {
    const [files, setFiles] = useState<FileMap>(initialFiles)
    const [active, setActive] = useState<string>('index.html')

    const fileList = useMemo(() => Object.keys(files).sort(), [files])

    return (
        <div className="h-screen w-full bg-white text-slate-900">
            <div className="flex h-full min-w-0">
                {/* Files */}
                <aside className="w-1/4 min-w-[220px] max-w-[420px] shrink-0 border-r border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">
                        Files
                    </div>
                    <div className="h-[calc(100%-49px)] overflow-auto p-2">
                        {fileList.map((p) => (
                            <button
                                key={p}
                                className={[
                                    'mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm',
                                    p === active
                                        ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200'
                                        : 'text-slate-700 hover:bg-slate-50',
                                ].join(' ')}
                                onClick={() => setActive(p)}
                            >
                                <span className="truncate">{p}</span>
                                <span className="ml-3 shrink-0 text-xs text-slate-500">
                                    {fileLang(p)}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Editor */}
                <section className="flex-1 min-w-0 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                        <div className="truncate text-sm font-semibold">
                            {active}
                        </div>
                        <div className="text-xs text-slate-500">autosave</div>
                    </div>

                    <div className="h-[calc(100%-49px)] min-w-0">
                        <Editor
                            theme="light"
                            language={fileLang(active)}
                            value={files[active]}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                automaticLayout: true,
                            }}
                            onChange={(v) =>
                                setFiles((prev) => ({
                                    ...prev,
                                    [active]: v ?? '',
                                }))
                            }
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import Editor from '@monaco-editor/react'
import classNames from 'classnames'

type Props = {
    data: any
    kind: 'behavior-hook' | 'extra-hook'
}

const methodColors: Record<string, string> = {
    GET: 'text-emerald-400',
    POST: 'text-amber-400',
    PUT: 'text-blue-400',
    PATCH: 'text-purple-400',
    DELETE: 'text-red-400',
}

function defaultBehaviorHookCode(data: any): string {
    const method = (data.method ?? 'GET').toLowerCase()
    return `import { DEvent } from '@Damba/v2';\n\n/**\n * ${data.method} handler\n */\nexport default async function ${method}Handler(e: DEvent) {\n  // TODO: implement\n  return e.out.json({ ok: true });\n};\n`
}

function defaultExtraHookCode(data: any): string {
    return `/**\n * Extra hook: ${data.name ?? 'unnamed'}\n */\nexport default async function ${data.name ?? 'handler'}(context: any) {\n  // TODO: implement\n};\n`
}

const CodeEditorPanel = ({ data, kind }: Props) => {
    const initialCode =
        kind === 'behavior-hook'
            ? defaultBehaviorHookCode(data)
            : defaultExtraHookCode(data)

    const [code, setCode] = useState(data.code ?? initialCode)
    const [dirty, setDirty] = useState(false)

    const handleChange = (value: string | undefined) => {
        setCode(value ?? '')
        setDirty(true)
    }

    const label =
        kind === 'behavior-hook'
            ? `${data.method} handler`
            : data.name ?? 'Extra hook'

    return (
        <div className="h-full flex flex-col">
            {/* Header bar */}
            <div className="h-10 px-4 border-b border-[#1E293B] flex items-center justify-between shrink-0 bg-[#0F172A]">
                <div className="flex items-center gap-2">
                    {kind === 'behavior-hook' && data.method && (
                        <span
                            className={classNames(
                                'text-[10px] font-bold',
                                methodColors[data.method] ?? 'text-gray-400',
                            )}
                        >
                            {data.method}
                        </span>
                    )}
                    <span className="text-xs text-gray-300">{label}</span>
                    {dirty && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600">
                        TypeScript
                    </span>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    theme="vs-dark"
                    language="typescript"
                    value={code}
                    onChange={handleChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily:
                            'JetBrains Mono, Monaco, Menlo, monospace',
                        lineNumbers: 'on',
                        renderWhitespace: 'selection',
                        bracketPairColorization: { enabled: true },
                        scrollBeyondLastLine: false,
                        padding: { top: 8 },
                        tabSize: 2,
                    }}
                />
            </div>
        </div>
    )
}

export default CodeEditorPanel

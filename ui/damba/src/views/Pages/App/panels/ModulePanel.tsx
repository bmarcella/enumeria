/* eslint-disable @typescript-eslint/no-explicit-any */
import Editor from '@monaco-editor/react'
import { HiOutlineCube } from 'react-icons/hi'

type Props = { data: any }

function generateIndexContent(mod: any): string {
    const services: any[] = mod.services ?? []
    if (!services.length) return `// Module: ${mod.name}\n// No services registered yet.\n\nexport default {};\n`

    const imports = services
        .map((s: any) => `import ${s.name} from './${s.name}';`)
        .join('\n')
    const exports = services.map((s: any) => `  ${s.name},`).join('\n')

    return `// Auto-generated — do not edit\n// Module: ${mod.name}\n\n${imports}\n\nexport default {\n${exports}\n};\n`
}

const ModulePanel = ({ data }: Props) => {
    const indexContent = generateIndexContent(data)
    const serviceCount = data.services?.length ?? 0

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1E293B] flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#fb732c]/10 flex items-center justify-center">
                    <HiOutlineCube className="text-lg text-[#fb732c]" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        {data.name}
                    </h2>
                    <p className="text-[11px] text-gray-500">
                        Module &middot; {serviceCount} service
                        {serviceCount !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Description */}
            {data.description && (
                <div className="px-5 py-3 border-b border-[#1E293B]">
                    <p className="text-xs text-gray-400">{data.description}</p>
                </div>
            )}

            {/* Index preview */}
            <div className="px-5 py-3 border-b border-[#1E293B] flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                    index.ts
                </span>
                <span className="text-[9px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                    auto-generated
                </span>
            </div>
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    theme="vs-dark"
                    language="typescript"
                    value={data.codeFileContent || indexContent}
                    options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 12,
                        fontFamily:
                            'JetBrains Mono, Monaco, Menlo, monospace',
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        padding: { top: 8 },
                        renderLineHighlight: 'none',
                    }}
                />
            </div>
        </div>
    )
}

export default ModulePanel

import React from 'react'
interface Props {
    previewUrl: string ;
}
function Preview( { previewUrl } : Props) {
    return (
        <section className="bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                <div className="text-sm font-medium">Preview</div>
                {previewUrl ? (
                    <a
                        className="text-xs text-slate-300 underline decoration-slate-600 underline-offset-4 hover:text-white"
                        href={previewUrl}
                        target="_blank"
                        rel="noreferrer"
                    >
                        open new tab
                    </a>
                ) : (
                    <span className="text-xs text-slate-500">waiting…</span>
                )}
            </div>
            <div className="h-[calc(100%-41px)]">
                {previewUrl ? (
                    <iframe
                        title="preview"
                        src={previewUrl}
                        className="h-full w-full bg-white"
                    />
                ) : (
                    <div className="p-4 text-sm text-slate-400">
                        Booting preview…
                    </div>
                )}
            </div>
        </section>
    )
}

export default Preview

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react"
import { Card, Button, Input } from "@/components/ui"
import { useNavigate } from "react-router-dom"
import { useToolArtifactsStore } from "@/stores/toolArtifactsStore"
import { HiOutlineCog, HiPlus } from "react-icons/hi"
import { HiOutlineWrenchScrewdriver } from "react-icons/hi2"

export function ToolArtifactsListPageBase({ gotToCreate }: { gotToCreate?: () => void }) {
  const nav = useNavigate()
  const { items, loading, fetchList, error } = useToolArtifactsStore()
  const [q, setQ] = useState("")

  useEffect(() => { fetchList() }, [fetchList])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return (items ?? []).filter((x: any) =>
      String(x?.name ?? "").toLowerCase().includes(s) ||
      String(x?.description ?? "").toLowerCase().includes(s) ||
      String(x?.runtime ?? "").toLowerCase().includes(s) ||
      String(x?.version ?? "").toLowerCase().includes(s)
    )
  }, [items, q])

  const handleCardClick = (id: string) => {
    nav(`/tool-artifacts/${id}`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineWrenchScrewdriver className="w-6 h-6 text-blue-600" />
            Tool Artifacts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create reusable custom tools (code, container, or wasm) to plug into agent manifests.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" className="flex items-center gap-2 shadow-sm rounded-sm" onClick={() => fetchList()}>Refresh</Button>
          <Button className="flex items-center gap-2 shadow-sm rounded-sm" onClick={gotToCreate}>
            <HiPlus className="w-4 h-4" />
            New Tool
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-6">
          <Input className="max-w-md bg-white border-slate-200" value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Search by name, runtime, version..." />
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        {loading ? (
          <p className="text-sm text-slate-500 mt-3 p-4">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-sm p-12 flex flex-col items-center text-center justify-center bg-slate-50/50 mt-4">
            <div className="w-12 h-12 bg-white flex items-center justify-center rounded-full shadow-sm mb-4 border border-slate-200">
              <HiOutlineCog className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No tools found</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
               You haven't created any tool artifacts yet. Get started by building your first one.
            </p>
            <Button variant="default" className="flex items-center gap-2 rounded-sm shadow-sm" onClick={gotToCreate}>
              <HiPlus className="w-4 h-4" />
              Create Your First Tool
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t: any) => (
              <Card
                key={t.id}
                onClick={() => handleCardClick(t.id)}
                className="p-5 flex flex-col relative transition-all duration-200 border-2 border-solid border-slate-300 dark:border-slate-600 hover:border-blue-600 hover:shadow-md bg-white cursor-pointer group rounded-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-sm border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors text-blue-600">
                      <HiOutlineWrenchScrewdriver />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {t.name || "Unnamed Tool"}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-slate-100 text-slate-700">
                           {t.sourceType ?? "inline_code"}
                        </span>
                        <span className="text-xs text-slate-400">
                          v{t.version ?? "1.0.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-6 flex-grow">
                  {t.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 border border-blue-100 rounded-sm">
                      {t.runtime ?? "node_vm"}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold bg-slate-50 text-slate-600 px-1.5 py-0.5 border border-slate-200 rounded-sm">
                      {t.status ?? "draft"}
                    </span>
                  </div>

                  <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity font-medium">
                    Open Editor &rarr;
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const ToolArtifactsListPage = (props: { gotToCreate?: () => void }) => {
    return <ToolArtifactsListPageBase gotToCreate={props.gotToCreate}></ToolArtifactsListPageBase>
}

export default ToolArtifactsListPage
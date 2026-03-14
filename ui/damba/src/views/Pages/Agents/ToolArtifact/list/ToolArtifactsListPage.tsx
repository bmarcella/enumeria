/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react"
import { Card, Button, Input } from "@/components/ui"
import { useNavigate } from "react-router-dom"
import { useToolArtifactsStore } from "@/stores/toolArtifactsStore"

export  function ToolArtifactsListPageBase() {
  const nav = useNavigate()
  const { items, loading, error, fetchList } = useToolArtifactsStore()
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <Card className="p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tool Artifacts</h1>
          <p className="text-sm text-muted-foreground">
            Create reusable custom tools (code, container, or wasm) to plug into agent manifests.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={() => fetchList()}>Refresh</Button>
          <Button onClick={() => nav("/tool-artifacts/new")}>New Tool</Button>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Search by name, runtime, version..." />
        </div>

        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        {loading && <p className="text-sm text-muted-foreground mt-3">Loading...</p>}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((t: any) => (
            <button
              key={t.id}
              type="button"
              onClick={() => nav(`/tool-artifacts/${t.id}`)}
              className="text-left"
            >
              <Card className="p-4 rounded-2xl border hover:shadow-sm transition">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{t.name}</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                    {t.status ?? "draft"}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {t.description || "—"}
                </div>
                <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-gray-50">{t.runtime ?? "node_vm"}</span>
                  <span className="px-2 py-1 rounded bg-gray-50">v{t.version ?? "1.0.0"}</span>
                  <span className="px-2 py-1 rounded bg-gray-50">{t.sourceType ?? "inline_code"}</span>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground mt-4">No tools found.</p>
        )}
      </Card>
    </div>
  )
}

const ToolArtifactsListPage  = ()=>{
    return <ToolArtifactsListPageBase></ToolArtifactsListPageBase>
}

export default ToolArtifactsListPage; 
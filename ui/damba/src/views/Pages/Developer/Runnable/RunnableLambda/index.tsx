/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react"
import { Card, Button, Input } from "@/components/ui"
import { useNavigate } from "react-router-dom"
import { useRunnableLambdaStore } from "@/stores/runnableLambdaStore"
import { HiOutlineCog, HiPlus, HiCode } from "react-icons/hi"

export function RunnableLambdaPageBase({ gotToCreate }: { gotToCreate?: () => void }) {
  const nav = useNavigate()
  const { runnableLambdas, loading, loadRunnableLambdas } = useRunnableLambdaStore()
  const [q, setQ] = useState("")

  useEffect(() => { loadRunnableLambdas() }, [loadRunnableLambdas])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return runnableLambdas
    return (runnableLambdas ?? []).filter((x: any) =>
      String(x?.name ?? "").toLowerCase().includes(s) ||
      String(x?.description ?? "").toLowerCase().includes(s) ||
      String(x?.runtime ?? "").toLowerCase().includes(s) ||
      String(x?.version ?? "").toLowerCase().includes(s)
    )
  }, [runnableLambdas, q])

  const handleCardClick = (id: string) => {
    nav(`/developer/runnable/${id}`)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <Card className="p-4 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Runnable Lambdas</h1>
          <p className="text-sm text-muted-foreground">
            Create reusable code blocks to plug into agent manifests.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={() => loadRunnableLambdas()}>Refresh</Button>
          <Button onClick={gotToCreate}>New Runnable Lambda</Button>
        </div>
      </Card>

      <Card className="p-4 rounded-2xl shadow-sm bg-card/40 border-border/40">
        <div className="flex items-center gap-2 mb-4 ">
          <Input value={q} onChange={(e: any) => setQ(e.target.value)} placeholder="Search by name, kind, version..." />
        </div>

        {loading && <p className="text-sm text-muted-foreground mt-3">Loading...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t: any) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleCardClick(t.id)}
              className="text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/50 relative group rounded-3xl"
            >
              <Card className="p-5 rounded-3xl border-2 border-solid border-slate-300 dark:border-slate-600 hover:border-primary/60 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.03)] hover:shadow-primary/5 transition-all duration-500 overflow-hidden bg-card relative transform hover:-translate-y-1">
                
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-primary/20 group-hover:scale-105 group-hover:bg-primary/20 transition-all duration-300">
                      <HiCode className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[16px] font-bold tracking-tight text-foreground/90 transition-colors group-hover:text-primary leading-tight pb-0.5">{t.name}</div>
                      <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 opacity-90">
                         {t.kind ?? "inline_transform"}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border/60 shadow-sm transition-colors group-hover:border-primary/20">
                    {t.status ?? "draft"}
                  </span>
                </div>
                
                <div className="text-sm text-foreground/70 mt-5 line-clamp-2 min-h-[2.5rem] relative z-10 leading-relaxed">
                  {t.description || "No description provided."}
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4 relative z-10">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground/90">
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted border border-border/60">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></span> {t.runtime ?? "node_vm"}
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted border border-border/60">
                      v{t.version ?? "1.0.0"}
                    </span>
                  </div>
                  <div className="text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0">
                    Open
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="border border-dashed border-slate-300 rounded-sm p-12 flex flex-col items-center text-center justify-center bg-slate-50/50 mt-4">
            <div className="w-12 h-12 bg-white flex items-center justify-center rounded-full shadow-sm mb-4 border border-slate-200">
              <HiOutlineCog className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No runnables found</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              You haven't created any runnable lambdas yet. Get started by building your first one.
            </p>
            <Button variant="default" className="flex items-center gap-2 rounded-sm shadow-sm" onClick={gotToCreate}>
              <HiPlus className="w-4 h-4" />
              Create Your First Runnable
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

const RunnableLambdaPage = (props: { gotToCreate?: () => void }) => {
    return <RunnableLambdaPageBase gotToCreate={props.gotToCreate}></RunnableLambdaPageBase>
}

export default RunnableLambdaPage
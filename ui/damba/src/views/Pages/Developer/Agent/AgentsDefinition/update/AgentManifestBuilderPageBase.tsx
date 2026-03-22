/* eslint-disable @typescript-eslint/no-explicit-any */
import  { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Card } from "@/components/ui"
import AgentManifestBuilderForm from "./AgentManifestBuilderForm"
import { defaultManifestValues, AgentManifestFormValues } from "@/validators/agentManifestSchema"
import { getAgentDefinition, updateAgentManifest } from "@/services/agents/AgentDefinition"

interface Props {
    agentId: string,
    onSaveManifest?: () => void
}

export  function AgentManifestBuilderPage( { agentId, onSaveManifest} : Props ) {
  const [loading, setLoading] = useState(true)
  const [initial, setInitial] = useState<AgentManifestFormValues>(defaultManifestValues)

  useEffect(() => {
    (async () => {
      setLoading(true)
      const res = await getAgentDefinition(agentId)
      const def = res?.agentDefinition
      setInitial(def?.agentManifest ?? defaultManifestValues)
      setLoading(false)
    })()
  }, [agentId])

  const onSave = async (manifest: AgentManifestFormValues) => {
    await updateAgentManifest(agentId, manifest)
    onSaveManifest?.()
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="p-4 rounded-2xl shadow-sm">Loading manifest...</Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <AgentManifestBuilderForm
        initialValues={initial}
        onSave={onSave}
        onValidate={(ok) => {
          console.log("manifest valid?", ok)
        }}
      />
    </div>
  )
}


export default AgentManifestBuilderPage;
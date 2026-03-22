import { useState } from "react";
import { AgentDefinitionCreate } from "./AgentDefinitionCreatePage"
import { AgentManifestBuilderPage } from "../update/AgentManifestBuilderPageBase";

const AgentCreationStep = () => {
    const [ agent, setAgent]   = useState<any>(null);
    
    const getNewAgent = (agent: any) => {
        setAgent(agent)
    }

    const onSaveManifest = () => {
        setAgent(null)
    }

    return (
        <>
        { !agent ? <AgentDefinitionCreate getNewAgent={getNewAgent} /> :
                   <AgentManifestBuilderPage agentId={agent.id} onSaveManifest={onSaveManifest} /> 
        } 
        </>
    )
}

export default AgentCreationStep
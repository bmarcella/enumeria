import React, { useEffect } from 'react'
import { useAgentDefinitionStore } from '@/stores/useAgentDefinitionStore'
import { Card, Spinner, Button } from '@/components/ui'
import { HiPlus, HiOutlineSparkles, HiOutlineCog } from 'react-icons/hi2'

function ShowListAgents( { gotToCreate } : { gotToCreate: () => void }) {
  const { agents, listState, listError, loadList } = useAgentDefinitionStore()

  useEffect(() => {
    loadList()
  }, [loadList])

  const loading = listState === 'loading'
  const error = listError

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineSparkles className="w-6 h-6 text-blue-600" />
            Your Agents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your AI agents across your organization or create new ones.
          </p>
        </div>
        <Button  onClick={gotToCreate} variant="default" className="flex items-center gap-2 shadow-sm rounded-sm">
          <HiPlus className="w-4 h-4" />
          Create Agent
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 space-y-4">
          <Spinner />
          <p className="text-sm">Loading agents...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-sm text-sm">
          {error}
        </div>
      ) : agents.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-sm p-12 flex flex-col items-center text-center justify-center bg-slate-50/50">
          <div className="w-12 h-12 bg-white flex items-center justify-center rounded-full shadow-sm mb-4 border border-slate-200">
            <HiOutlineCog className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No agents found</h3>
          <p className="text-sm text-slate-500 max-w-sm mb-4">
            You haven't created any agents yet. Get started by building your first AI assistant.
          </p>
          <Button variant="default" className="flex items-center gap-2 rounded-sm shadow-sm" onClick={gotToCreate}>
            <HiPlus className="w-4 h-4" />
            Create Your First Agent
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <Card 
              key={agent.id || agent._id} 
              className="p-5 flex flex-col relative transition-all duration-200 border border-slate-200 rounded-sm hover:border-blue-600 hover:shadow-md bg-white cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-sm border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/50 transition-colors">
                    {agent.emoji || '🤖'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {agent.name || 'Unnamed Agent'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-slate-100 text-slate-700">
                        {agent.roleType || 'Unknown'}
                      </span>
                      <span className="text-xs text-slate-400">
                        v{agent.version || '0.1.0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 line-clamp-2 mb-6 flex-grow">
                {agent.description || 'No description provided for this agent.'}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-wrap gap-1">
                  {(agent.scopes || []).slice(0, 2).map((scope: string) => (
                    <span key={scope} className="text-[10px] uppercase tracking-wider font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.5 border border-blue-100 rounded-sm">
                      {scope}
                    </span>
                  ))}
                  {(agent.scopes?.length > 2) && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 px-1">
                      +{agent.scopes.length - 2}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity font-medium">
                  Manage &rarr;
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ShowListAgents
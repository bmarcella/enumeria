/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { HiOutlineUser, HiOutlineClipboardList } from 'react-icons/hi';
import ActorNode, { ActorNodeData } from './components/ActorNode';
import UseCaseNode, { UseCaseNodeData } from './components/UseCaseNode';
import UseCaseInspector from './components/UseCaseInspector';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes: NodeTypes = {
  actor: ActorNode,
  usecase: UseCaseNode,
};

const UseCasesView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const actorCount = useMemo(() => nodes.filter(n => n.type === 'actor').length, [nodes]);
  const ucCount = useMemo(() => nodes.filter(n => n.type === 'usecase').length, [nodes]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    const node = nodes.find(n => n.id === selectedId);
    if (!node) return null;
    if (node.type === 'actor') {
      return { kind: 'actor' as const, id: node.id, name: node.data.label, actorType: node.data.actorType || 'human' };
    }
    return {
      kind: 'usecase' as const,
      id: node.id,
      name: node.data.label,
      role: node.data.role || '',
      action: node.data.action || '',
      benefit: node.data.benefit || '',
      priority: node.data.priority || 'medium',
      scenarios: node.data.scenarios || [],
    };
  }, [selectedId, nodes]);

  const handleAddActor = useCallback(() => {
    const id = uuidv4();
    const newNode: Node<ActorNodeData> = {
      id, type: 'actor',
      position: { x: 50, y: Math.random() * 300 + 100 },
      data: { label: 'Nouvel Acteur', actorType: 'human' },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedId(id);
  }, [setNodes]);

  const handleAddUseCase = useCallback(() => {
    const id = uuidv4();
    const newNode: Node<UseCaseNodeData> = {
      id, type: 'usecase',
      position: { x: 350 + Math.random() * 200, y: Math.random() * 300 + 100 },
      data: { label: 'Nouveau Cas', priority: 'medium', scenarioCount: 0 },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedId(id);
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== nodeId) return n;
      const newData = { ...n.data };
      if (data.label !== undefined) newData.label = data.label;
      if (data.actorType !== undefined) newData.actorType = data.actorType;
      if (data.role !== undefined) newData.role = data.role;
      if (data.action !== undefined) newData.action = data.action;
      if (data.benefit !== undefined) newData.benefit = data.benefit;
      if (data.priority !== undefined) newData.priority = data.priority;
      return { ...n, data: newData };
    }));
  }, [setNodes]);

  const handleAddScenario = useCallback((useCaseId: string) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== useCaseId) return n;
      const scenarios = [...(n.data.scenarios || []), { id: uuidv4(), title: '', content: '', type: 'nominal' }];
      return { ...n, data: { ...n.data, scenarios, scenarioCount: scenarios.length } };
    }));
  }, [setNodes]);

  const handleUpdateScenario = useCallback((useCaseId: string, scenarioId: string, data: any) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== useCaseId) return n;
      const scenarios = (n.data.scenarios || []).map((s: any) => s.id === scenarioId ? { ...s, ...data } : s);
      return { ...n, data: { ...n.data, scenarios } };
    }));
  }, [setNodes]);

  const handleDeleteScenario = useCallback((useCaseId: string, scenarioId: string) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== useCaseId) return n;
      const scenarios = (n.data.scenarios || []).filter((s: any) => s.id !== scenarioId);
      return { ...n, data: { ...n.data, scenarios, scenarioCount: scenarios.length } };
    }));
  }, [setNodes]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection, type: 'smoothstep', animated: false,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    }, eds));
  }, [setEdges]);

  return (
    <div className="flex flex-col h-full w-full bg-gray-950">
      {/* Toolbar */}
      <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900/90 backdrop-blur-md shrink-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-gray-400">Cas d&apos;utilisation</span>
          <span className="w-px h-5 bg-gray-800" />
          <span className="text-xs text-gray-500">{actorCount} acteur(s)</span>
          <span className="text-xs text-gray-600">|</span>
          <span className="text-xs text-gray-500">{ucCount} cas</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAddActor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-600 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all">
            <HiOutlineUser className="text-sm" /> Acteur
          </button>
          <button onClick={handleAddUseCase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all">
            <HiOutlineClipboardList className="text-sm" /> Cas
          </button>
        </div>
      </div>

      {/* Canvas + Inspector */}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onPaneClick={() => setSelectedId(null)}
            nodeTypes={nodeTypes}
            fitView
            className="!bg-[#0b0f1a]"
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={40} size={1.5} color="#8b5cf6" style={{ opacity: 0.1 }} />
            <Controls className="!bg-gray-800 !border-gray-700 !shadow-2xl [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-400 [&>button:hover]:!bg-gray-700" />
            <MiniMap nodeStrokeWidth={3} nodeColor="#8b5cf6" maskColor="rgba(11, 15, 26, 0.85)" className="!bg-gray-900 !border-gray-800" />
          </ReactFlow>
        </div>

        <aside
          className={`border-l border-gray-800 bg-[#0b0f1a] flex flex-col shadow-2xl shrink-0 transition-all duration-300 ${
            selectedId ? 'w-80' : 'w-0'
          } overflow-hidden`}
        >
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/40 shrink-0">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Inspecteur</h3>
            {selectedId && (
              <button onClick={() => setSelectedId(null)} className="text-gray-500 hover:text-white text-xs">✕</button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <UseCaseInspector
              selected={selectedItem}
              onUpdateActor={updateNodeData}
              onUpdateUseCase={updateNodeData}
              onAddScenario={handleAddScenario}
              onUpdateScenario={handleUpdateScenario}
              onDeleteScenario={handleDeleteScenario}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default UseCasesView;

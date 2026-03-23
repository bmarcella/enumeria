import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { HiOutlinePlus, HiOutlineUser, HiOutlineClipboardList } from 'react-icons/hi';
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
      position: { x: 50, y: Math.random() * 300 + 50 },
      data: { label: 'Nouvel Acteur', actorType: 'human' },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedId(id);
  }, [setNodes]);

  const handleAddUseCase = useCallback(() => {
    const id = uuidv4();
    const newNode: Node<UseCaseNodeData> = {
      id, type: 'usecase',
      position: { x: 300 + Math.random() * 200, y: Math.random() * 300 + 50 },
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
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#8b5cf6' },
    }, eds));
  }, [setEdges]);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button onClick={handleAddActor}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-lg text-sm">
            <HiOutlineUser /> Acteur
          </button>
          <button onClick={handleAddUseCase}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-lg text-sm">
            <HiOutlineClipboardList /> Cas d'utilisation
          </button>
        </div>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          onPaneClick={() => setSelectedId(null)}
          nodeTypes={nodeTypes}
          fitView className="bg-gray-50 dark:bg-gray-900"
        >
          <Background gap={16} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
      <div className="w-80 border-l dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
        <div className="p-3 border-b dark:border-gray-700">
          <h3 className="text-sm font-bold dark:text-gray-200">Inspecteur</h3>
        </div>
        <UseCaseInspector
          selected={selectedItem}
          onUpdateActor={updateNodeData}
          onUpdateUseCase={updateNodeData}
          onAddScenario={handleAddScenario}
          onUpdateScenario={handleUpdateScenario}
          onDeleteScenario={handleDeleteScenario}
        />
      </div>
    </div>
  );
};

export default UseCasesView;

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
import { HiOutlinePlus, HiOutlineTable, HiOutlineLink } from 'react-icons/hi';
import EntityNode, { EntityNodeData } from './components/EntityNode';
import EntityInspector from './components/EntityInspector';
import { v4 as uuidv4 } from 'uuid';

const nodeTypes: NodeTypes = {
  entity: EntityNode,
};

const DataModelerView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<EntityNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const selectedEntity = useMemo(() => {
    if (!selectedEntityId) return null;
    const node = nodes.find(n => n.id === selectedEntityId);
    if (!node) return null;
    return { id: node.id, name: node.data.label, columns: node.data.columns || [] };
  }, [selectedEntityId, nodes]);

  const handleAddEntity = useCallback(() => {
    const id = uuidv4();
    const newNode: Node<EntityNodeData> = {
      id,
      type: 'entity',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: 'new_table',
        columns: [
          { id: uuidv4(), name: 'id', dataType: 'UUID', isPrimaryKey: true, isForeignKey: false, isNotNull: true },
          { id: uuidv4(), name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNotNull: true },
          { id: uuidv4(), name: 'updated_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNotNull: false },
        ],
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedEntityId(id);
  }, [setNodes]);

  const handleUpdateEntity = useCallback((entityId: string, data: Partial<{ name: string }>) => {
    setNodes((nds) =>
      nds.map((n) => n.id === entityId ? { ...n, data: { ...n.data, label: data.name ?? n.data.label } } : n)
    );
  }, [setNodes]);

  const handleAddColumn = useCallback((entityId: string, column: any) => {
    const newCol = { ...column, id: uuidv4() };
    setNodes((nds) =>
      nds.map((n) => n.id === entityId ? { ...n, data: { ...n.data, columns: [...(n.data.columns || []), newCol] } } : n)
    );
  }, [setNodes]);

  const handleUpdateColumn = useCallback((entityId: string, columnId: string, data: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== entityId) return n;
        return { ...n, data: { ...n.data, columns: n.data.columns.map((c: any) => c.id === columnId ? { ...c, ...data } : c) } };
      })
    );
  }, [setNodes]);

  const handleDeleteColumn = useCallback((entityId: string, columnId: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== entityId) return n;
        return { ...n, data: { ...n.data, columns: n.data.columns.filter((c: any) => c.id !== columnId) } };
      })
    );
  }, [setNodes]);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      animated: true,
      label: '1:N',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
      style: { stroke: '#6366f1', strokeWidth: 2 },
      labelStyle: { fill: '#94a3b8', fontSize: 11, fontWeight: 700 },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 0.9 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
    }, eds));
  }, [setEdges]);

  return (
    <div className="flex flex-col h-full w-full bg-gray-950">
      {/* Toolbar */}
      <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 bg-gray-900/90 backdrop-blur-md shrink-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-gray-400">Data Modeler</span>
          <span className="w-px h-5 bg-gray-800" />
          <span className="text-xs text-gray-500">{nodes.length} entite(s)</span>
          <span className="text-xs text-gray-600">|</span>
          <span className="text-xs text-gray-500">{edges.length} relation(s)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddEntity}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-all"
          >
            <HiOutlineTable className="text-sm" /> Entite
          </button>
        </div>
      </div>

      {/* Canvas + Inspector */}
      <div className="flex flex-1 min-h-0">
        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedEntityId(node.id)}
            onPaneClick={() => setSelectedEntityId(null)}
            nodeTypes={nodeTypes}
            fitView
            className="!bg-[#0b0f1a]"
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={40} size={1.5} color="#6366f1" style={{ opacity: 0.1 }} />
            <Controls className="!bg-gray-800 !border-gray-700 !shadow-2xl [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-400 [&>button:hover]:!bg-gray-700" />
            <MiniMap
              nodeStrokeWidth={3}
              nodeColor="#6366f1"
              maskColor="rgba(11, 15, 26, 0.85)"
              className="!bg-gray-900 !border-gray-800"
            />
          </ReactFlow>
        </div>

        {/* Inspector */}
        <aside
          className={`border-l border-gray-800 bg-[#0b0f1a] flex flex-col shadow-2xl shrink-0 transition-all duration-300 ${
            selectedEntityId ? 'w-80' : 'w-0'
          } overflow-hidden`}
        >
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/40 shrink-0">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Inspecteur</h3>
            {selectedEntityId && (
              <button onClick={() => setSelectedEntityId(null)} className="text-gray-500 hover:text-white text-xs">
                ✕
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <EntityInspector
              entity={selectedEntity}
              onUpdateEntity={handleUpdateEntity}
              onAddColumn={handleAddColumn}
              onUpdateColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DataModelerView;

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
import { HiOutlinePlus } from 'react-icons/hi';
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
      position: { x: Math.random() * 400 + 50, y: Math.random() * 300 + 50 },
      data: {
        label: 'new_table',
        columns: [
          { id: uuidv4(), name: 'id', dataType: 'UUID', isPrimaryKey: true, isForeignKey: false, isNotNull: true },
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
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#6366f1' },
    }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedEntityId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedEntityId(null);
  }, []);

  return (
    <div className="flex h-full w-full">
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={handleAddEntity}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-lg"
          >
            <HiOutlinePlus className="text-lg" />
            Nouvelle Entite
          </button>
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50 dark:bg-gray-900"
        >
          <Background gap={16} size={1} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} />
        </ReactFlow>
      </div>
      <div className="w-80 border-l dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
        <div className="p-3 border-b dark:border-gray-700">
          <h3 className="text-sm font-bold dark:text-gray-200">Inspecteur</h3>
        </div>
        <EntityInspector
          entity={selectedEntity}
          onUpdateEntity={handleUpdateEntity}
          onAddColumn={handleAddColumn}
          onUpdateColumn={handleUpdateColumn}
          onDeleteColumn={handleDeleteColumn}
        />
      </div>
    </div>
  );
};

export default DataModelerView;

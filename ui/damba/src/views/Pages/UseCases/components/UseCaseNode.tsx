import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export type UseCaseNodeData = {
  label: string;
  role?: string;
  action?: string;
  benefit?: string;
  priority?: string;
  color?: string;
  scenarioCount?: number;
  scenarios?: any[];
};

const priorityBorders: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#6366f1',
  low: '#64748b',
};

const UseCaseNode = memo(({ data, selected }: NodeProps<UseCaseNodeData>) => {
  const borderColor = selected ? '#ffffff' : (priorityBorders[data.priority || 'medium'] || '#6366f1');

  return (
    <div
      className={`rounded-[2rem] px-6 py-4 min-w-[180px] text-center ${
        selected ? 'shadow-[0_0_0_6px_rgba(255,255,255,0.1)]' : ''
      }`}
      style={{
        backgroundColor: '#111827',
        border: `2px solid ${borderColor}`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div className="text-sm font-bold text-slate-200">{data.label}</div>
      {data.role && <div className="text-[10px] text-slate-500 mt-1">En tant que {data.role}</div>}
      {data.scenarioCount !== undefined && data.scenarioCount > 0 && (
        <div className="text-[10px] text-indigo-400 mt-0.5 font-semibold">{data.scenarioCount} scenario(s)</div>
      )}
      <Handle type="target" position={Position.Left} className="!bg-emerald-500 !w-2.5 !h-2.5 !border-2 !border-gray-900" />
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5 !border-2 !border-gray-900" />
    </div>
  );
});

UseCaseNode.displayName = 'UseCaseNode';
export default UseCaseNode;

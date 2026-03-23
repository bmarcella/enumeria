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
};

const priorityColors: Record<string, string> = {
  critical: 'border-red-500',
  high: 'border-orange-500',
  medium: 'border-blue-500',
  low: 'border-gray-400',
};

const UseCaseNode = memo(({ data, selected }: NodeProps<UseCaseNodeData>) => {
  const border = selected ? 'border-blue-600 shadow-blue-200' : (priorityColors[data.priority || 'medium'] || 'border-blue-500');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-full border-2 ${border} shadow-md px-6 py-4 min-w-[160px] text-center`}>
      <div className="text-sm font-semibold dark:text-gray-200">{data.label}</div>
      {data.role && <div className="text-[10px] text-gray-400 mt-1">En tant que {data.role}</div>}
      {data.scenarioCount !== undefined && data.scenarioCount > 0 && (
        <div className="text-[10px] text-blue-400 mt-0.5">{data.scenarioCount} scenario(s)</div>
      )}
      <Handle type="target" position={Position.Left} className="!bg-green-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-2.5 !h-2.5" />
    </div>
  );
});

UseCaseNode.displayName = 'UseCaseNode';
export default UseCaseNode;

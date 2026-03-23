import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { HiOutlineUser, HiOutlineDesktopComputer } from 'react-icons/hi';

export type ActorNodeData = {
  label: string;
  actorType: 'human' | 'system' | 'external';
  color?: string;
};

const ActorNode = memo(({ data, selected }: NodeProps<ActorNodeData>) => {
  const Icon = data.actorType === 'system' ? HiOutlineDesktopComputer : HiOutlineUser;
  const borderColor = selected ? 'border-blue-500' : 'border-gray-300 dark:border-gray-600';

  return (
    <div className={`flex flex-col items-center gap-1 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 ${borderColor} shadow-md min-w-[100px]`}>
      <Icon className={`text-3xl ${data.color || 'text-gray-600 dark:text-gray-300'}`} />
      <span className="text-xs font-medium text-center dark:text-gray-200">{data.label}</span>
      <span className="text-[10px] text-gray-400">{data.actorType}</span>
      <Handle type="source" position={Position.Right} className="!bg-blue-500 !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Left} className="!bg-green-500 !w-2.5 !h-2.5" />
    </div>
  );
});

ActorNode.displayName = 'ActorNode';
export default ActorNode;

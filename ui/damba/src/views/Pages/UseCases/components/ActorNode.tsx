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

  return (
    <div
      className={`flex flex-col items-center gap-2 px-5 py-4 rounded-xl min-w-[110px] ${
        selected
          ? 'border-2 border-white shadow-[0_0_0_6px_rgba(255,255,255,0.1)]'
          : 'border border-slate-700'
      }`}
      style={{ backgroundColor: '#111827', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
    >
      <Icon className="text-3xl text-indigo-400" />
      <span className="text-xs font-bold text-slate-200 text-center">{data.label}</span>
      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">{data.actorType}</span>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2.5 !h-2.5 !border-2 !border-gray-900" />
      <Handle type="target" position={Position.Left} className="!bg-emerald-500 !w-2.5 !h-2.5 !border-2 !border-gray-900" />
    </div>
  );
});

ActorNode.displayName = 'ActorNode';
export default ActorNode;

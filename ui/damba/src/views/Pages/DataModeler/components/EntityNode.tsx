import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { HiOutlineKey, HiOutlineLink } from 'react-icons/hi';

export type EntityNodeData = {
  label: string;
  columns: Array<{
    id: string;
    name: string;
    dataType: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    isNotNull: boolean;
  }>;
  color?: string;
};

const EntityNode = memo(({ data, selected }: NodeProps<EntityNodeData>) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 min-w-[220px] ${selected ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className={`px-3 py-2 rounded-t-md font-bold text-sm text-white ${data.color || 'bg-blue-600'}`}>
        {data.label}
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {data.columns?.map((col, i) => (
          <div key={col.id || i} className="flex items-center gap-2 px-3 py-1.5 text-xs">
            {col.isPrimaryKey && <HiOutlineKey className="text-yellow-500 flex-shrink-0" />}
            {col.isForeignKey && <HiOutlineLink className="text-green-500 flex-shrink-0" />}
            <span className={`font-medium dark:text-gray-200 ${col.isNotNull ? '' : 'text-gray-500'}`}>{col.name}</span>
            <span className="ml-auto text-gray-400 dark:text-gray-500">{col.dataType}</span>
          </div>
        ))}
        {(!data.columns || data.columns.length === 0) && (
          <div className="px-3 py-2 text-xs text-gray-400 italic">No columns</div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="!bg-blue-500 !w-3 !h-3" />
      <Handle type="source" position={Position.Right} className="!bg-green-500 !w-3 !h-3" />
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
export default EntityNode;

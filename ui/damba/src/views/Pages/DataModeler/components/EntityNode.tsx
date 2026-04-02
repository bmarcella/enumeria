import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { HiOutlineKey, HiOutlineLink } from 'react-icons/hi';

export type EntityNodeData = {
  label: string;
  isAbstract?: boolean;
  parentEntity?: string;
  columns: Array<{
    id: string;
    name: string;
    dataType: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
    isNotNull: boolean;
    isUnique: boolean;
    enumValues?: string[];
    defaultValue?: string;
    referenceEntity?: string;
    referenceColumn?: string;
    relationType?: string;
    edgeId?: string;
  }>;
  color?: string;
};

const ABSTRACT_COLOR = '#9333ea';
const DEFAULT_COLOR = '#4f46e5';

const EntityNode = memo(({ data, selected }: NodeProps<EntityNodeData>) => {
  const headerColor = data.color || (data.isAbstract ? ABSTRACT_COLOR : DEFAULT_COLOR);

  return (
    <div
      className={`rounded-xl flex flex-col min-w-[260px] ${
        selected
          ? 'border-2 border-white shadow-[0_0_0_6px_rgba(255,255,255,0.1)]'
          : data.isAbstract
            ? 'border border-purple-500/50 border-dashed'
            : 'border border-gray-700'
      }`}
      style={{ backgroundColor: '#111827', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
    >
      <div
        className="px-4 py-2.5 rounded-t-xl flex items-center gap-2 border-b border-gray-700/50"
        style={{ backgroundColor: headerColor }}
      >
        <span className="text-xs font-black uppercase tracking-wider text-white truncate">{data.label}</span>
        {data.isAbstract && (
          <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-white/70 bg-white/15 px-1.5 py-0.5 rounded">Abstract</span>
        )}
      </div>

      <div className="divide-y divide-gray-800/50">
        {data.columns?.map((col) => (
          <div key={col.id} className="flex items-center gap-2 px-3 py-1.5 text-[11px] hover:bg-gray-800/40 transition-colors">
            <span className="w-4 flex-shrink-0 text-center">
              {col.isPrimaryKey && <HiOutlineKey className="text-amber-400 text-xs" />}
              {col.isForeignKey && !col.isPrimaryKey && <HiOutlineLink className="text-emerald-400 text-xs" />}
            </span>
            <span className={`font-semibold ${col.isNotNull ? 'text-slate-200' : 'text-slate-400'}`}>
              {col.name}
            </span>
            <span className="ml-auto text-slate-500 font-mono text-[10px]">{col.dataType}</span>
          </div>
        ))}
        {(!data.columns || data.columns.length === 0) && (
          <div className="px-3 py-3 text-[11px] text-slate-500 italic text-center">Aucune colonne</div>
        )}
      </div>

      {!data.isAbstract && (
        <>
          <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2.5 !h-2.5 !border-2 !border-gray-900" />
          <Handle type="source" position={Position.Right} className="!bg-emerald-500 !w-2.5 !h-2.5 !border-2 !border-gray-900" />
        </>
      )}
    </div>
  );
});

EntityNode.displayName = 'EntityNode';
export default EntityNode;

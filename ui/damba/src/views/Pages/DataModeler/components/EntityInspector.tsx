import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

type Column = {
  id: string;
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isNotNull: boolean;
  defaultValue?: string;
};

type Props = {
  entity: { id: string; name: string; columns: Column[] } | null;
  onUpdateEntity: (id: string, data: Partial<{ name: string }>) => void;
  onAddColumn: (entityId: string, column: Partial<Column>) => void;
  onUpdateColumn: (entityId: string, columnId: string, data: Partial<Column>) => void;
  onDeleteColumn: (entityId: string, columnId: string) => void;
};

const DATA_TYPES = ['UUID', 'INT', 'BIGINT', 'VARCHAR(255)', 'TEXT', 'BOOLEAN', 'FLOAT', 'DECIMAL', 'DATE', 'TIMESTAMP', 'JSONB'];

const EntityInspector = ({ entity, onUpdateEntity, onAddColumn, onUpdateColumn, onDeleteColumn }: Props) => {
  if (!entity) return (
    <div className="p-6 text-xs text-slate-500">
      Selectionnez une entite pour voir ses proprietes
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Entity name */}
      <div>
        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2 block">Nom de l&apos;entite</label>
        <input
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          value={entity.name}
          onChange={(ev) => onUpdateEntity(entity.id, { name: ev.target.value })}
        />
      </div>

      {/* Columns */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Colonnes ({entity.columns?.length || 0})</label>
          <button
            onClick={() => onAddColumn(entity.id, { name: 'new_column', dataType: 'VARCHAR(255)', isPrimaryKey: false, isForeignKey: false, isUnique: false, isNotNull: false })}
            className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <HiOutlinePlus className="text-xs" /> Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {entity.columns?.map((col) => (
            <div key={col.id} className="border border-slate-800 rounded-lg p-3 bg-slate-900/50 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={col.name}
                  onChange={(ev) => onUpdateColumn(entity.id, col.id, { name: ev.target.value })}
                />
                <select
                  className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={col.dataType}
                  onChange={(ev) => onUpdateColumn(entity.id, col.id, { dataType: ev.target.value })}
                >
                  {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => onDeleteColumn(entity.id, col.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <HiOutlineTrash className="text-sm" />
                </button>
              </div>
              <div className="flex gap-4 text-[10px] text-slate-500">
                <label className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition-colors">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 w-3 h-3" checked={col.isPrimaryKey} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isPrimaryKey: ev.target.checked })} /> PK
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition-colors">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 w-3 h-3" checked={col.isNotNull} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isNotNull: ev.target.checked })} /> NOT NULL
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition-colors">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 w-3 h-3" checked={col.isUnique} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isUnique: ev.target.checked })} /> UQ
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition-colors">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 w-3 h-3" checked={col.isForeignKey} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isForeignKey: ev.target.checked })} /> FK
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntityInspector;

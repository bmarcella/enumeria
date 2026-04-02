import { useState } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineX, HiOutlineLink } from 'react-icons/hi';

type Column = {
  id: string;
  name: string;
  dataType: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isNotNull: boolean;
  defaultValue?: string;
  enumValues?: string[];
  referenceEntity?: string;
  referenceColumn?: string;
  relationType?: string;
  edgeId?: string;
};

type EntitySummary = { id: string; name: string; isAbstract?: boolean; columns: { id: string; name: string }[] };

type Props = {
  entity: { id: string; name: string; isAbstract?: boolean; parentEntity?: string; columns: Column[] } | null;
  allEntities: EntitySummary[];
  onUpdateEntity: (id: string, data: Partial<{ name: string; isAbstract: boolean; parentEntity: string | undefined }>) => void;
  onAddColumn: (entityId: string, column: Partial<Column>) => void;
  onUpdateColumn: (entityId: string, columnId: string, data: Partial<Column>) => void;
  onDeleteColumn: (entityId: string, columnId: string) => void;
};

const DATA_TYPES = ['UUID', 'INT', 'BIGINT', 'VARCHAR(255)', 'TEXT', 'BOOLEAN', 'FLOAT', 'DECIMAL', 'DATE', 'TIMESTAMP', 'JSONB', 'ENUM'];

const EnumValuesEditor = ({ entityId, col, onUpdateColumn }: { entityId: string; col: Column; onUpdateColumn: Props['onUpdateColumn'] }) => {
  const [newValue, setNewValue] = useState('');
  const values = col.enumValues ?? [];

  const addValue = () => {
    const trimmed = newValue.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onUpdateColumn(entityId, col.id, { enumValues: [...values, trimmed] });
    setNewValue('');
  };

  const removeValue = (val: string) => {
    onUpdateColumn(entityId, col.id, { enumValues: values.filter((v) => v !== val) });
  };

  return (
    <div className="rounded bg-slate-800/60 border border-slate-700/50 p-2 space-y-1.5">
      <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Valeurs</label>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((val) => (
            <span key={val} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-[10px] text-indigo-300">
              {val}
              <button onClick={() => removeValue(val)} className="text-indigo-400 hover:text-red-400 transition-colors">
                <HiOutlineX className="text-[10px]" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-1">
        <input
          className="flex-1 min-w-0 px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={newValue}
          onChange={(ev) => setNewValue(ev.target.value)}
          onKeyDown={(ev) => ev.key === 'Enter' && addValue()}
          placeholder="Nouvelle valeur"
        />
        <button onClick={addValue} className="text-indigo-400 hover:text-indigo-300 transition-colors shrink-0 p-0.5">
          <HiOutlinePlus className="text-sm" />
        </button>
      </div>
    </div>
  );
};

const EntityInspector = ({ entity, allEntities, onUpdateEntity, onAddColumn, onUpdateColumn, onDeleteColumn }: Props) => {
  if (!entity) return (
    <div className="p-4 text-xs text-slate-500">
      Selectionnez une entite pour voir ses proprietes
    </div>
  );

  return (
    <div className="p-4 space-y-5">
      {/* Entity name */}
      <div>
        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">Nom de l&apos;entite</label>
        <input
          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          value={entity.name}
          onChange={(ev) => onUpdateEntity(entity.id, { name: ev.target.value })}
        />
      </div>

      {/* Abstract toggle */}
      <div className="flex items-center justify-between">
        <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Abstract</label>
        <button
          onClick={() => {
            const next = !entity.isAbstract;
            onUpdateEntity(entity.id, { isAbstract: next, ...(next ? {} : {}) });
          }}
          className={`relative w-8 h-4 rounded-full transition-colors ${entity.isAbstract ? 'bg-purple-600' : 'bg-slate-700'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${entity.isAbstract ? 'translate-x-4' : ''}`} />
        </button>
      </div>

      {/* Parent entity (inheritance) — abstract can only inherit from abstract */}
      {(() => {
        const parentCandidates = allEntities.filter((e) => e.isAbstract && e.id !== entity.id);
        if (parentCandidates.length === 0) return null;
        return (
          <div>
            <label className="text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">Herite de</label>
            <select
              className="w-full px-2.5 py-1.5 bg-slate-800 border border-purple-500/30 rounded-md text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
              value={entity.parentEntity ?? ''}
              onChange={(ev) => onUpdateEntity(entity.id, { parentEntity: ev.target.value || undefined })}
            >
              <option value="">Aucun</option>
              {parentCandidates.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
        );
      })()}

      {/* Columns */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-slate-500">Colonnes ({entity.columns?.length || 0})</label>
          <button
            onClick={() => onAddColumn(entity.id, { name: 'new_column', dataType: 'VARCHAR(255)', isPrimaryKey: false, isForeignKey: false, isUnique: false, isNotNull: false })}
            className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <HiOutlinePlus className="text-xs" /> Ajouter
          </button>
        </div>
        <div className="space-y-1.5">
          {entity.columns?.map((col) => (
            <div key={col.id} className="border border-slate-800 rounded-lg p-2.5 bg-slate-900/50 space-y-2">
              {/* Column header: name + delete */}
              <div className="flex items-center gap-1.5">
                <input
                  className="flex-1 min-w-0 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={col.name}
                  onChange={(ev) => onUpdateColumn(entity.id, col.id, { name: ev.target.value })}
                  placeholder="column_name"
                />
                <button onClick={() => onDeleteColumn(entity.id, col.id)} className="text-slate-600 hover:text-red-400 transition-colors shrink-0 p-0.5">
                  <HiOutlineTrash className="text-sm" />
                </button>
              </div>
              {/* Data type: full width */}
              <select
                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={col.dataType}
                onChange={(ev) => {
                  const update: Partial<Column> = { dataType: ev.target.value };
                  if (ev.target.value !== 'ENUM') update.enumValues = undefined;
                  onUpdateColumn(entity.id, col.id, update);
                }}
              >
                {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {/* Enum values editor */}
              {col.dataType === 'ENUM' && (
                <EnumValuesEditor entityId={entity.id} col={col} onUpdateColumn={onUpdateColumn} />
              )}
              {/* Constraints: wrapping grid */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-500">
                <label className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition-colors">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 w-3 h-3" checked={col.isPrimaryKey} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isPrimaryKey: ev.target.checked })} /> PK
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition-colors">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 w-3 h-3" checked={col.isNotNull} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isNotNull: ev.target.checked })} /> NOT NULL
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-slate-300 transition-colors">
                  <input type="checkbox" className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 w-3 h-3" checked={col.isUnique} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isUnique: ev.target.checked })} /> UQ
                </label>
              </div>
              {/* FK reference info (created by drag) */}
              {col.isForeignKey && (() => {
                const refEntity = allEntities.find((e) => e.id === col.referenceEntity);
                const refColumn = refEntity?.columns.find((c) => c.id === col.referenceColumn);
                return (
                  <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <HiOutlineLink className="text-xs shrink-0" />
                      <span className="truncate">
                        {refEntity?.name ?? '?'}.{refColumn?.name ?? '?'}
                      </span>
                    </div>
                    <select
                      className="w-full px-2 py-1 bg-slate-800 border border-emerald-500/30 rounded text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={col.relationType ?? '1:N'}
                      onChange={(ev) => onUpdateColumn(entity.id, col.id, { relationType: ev.target.value })}
                    >
                      <option value="1:1">1:1 — One to One</option>
                      <option value="1:N">1:N — One to Many</option>
                      <option value="N:1">N:1 — Many to One</option>
                      <option value="N:N">N:N — Many to Many</option>
                    </select>
                  </div>
                );
              })()}
              {/* Default value */}
              <div>
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Valeur par defaut</label>
                {col.dataType === 'ENUM' ? (
                  <select
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={col.defaultValue ?? ''}
                    onChange={(ev) => onUpdateColumn(entity.id, col.id, { defaultValue: ev.target.value || undefined })}
                  >
                    <option value="">Aucune</option>
                    {(col.enumValues ?? []).map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                ) : (
                  <input
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={col.defaultValue ?? ''}
                    onChange={(ev) => onUpdateColumn(entity.id, col.id, { defaultValue: ev.target.value || undefined })}
                    placeholder="NULL"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntityInspector;

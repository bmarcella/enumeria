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
    <div className="p-4 text-sm text-gray-400 dark:text-gray-500">
      Selectionnez une entite pour voir ses proprietes
    </div>
  );

  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Nom de l'entite</label>
        <input
          className="w-full mt-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          value={entity.name}
          onChange={(ev) => onUpdateEntity(entity.id, { name: ev.target.value })}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Colonnes</label>
          <button
            onClick={() => onAddColumn(entity.id, { name: 'new_column', dataType: 'VARCHAR(255)', isPrimaryKey: false, isForeignKey: false, isUnique: false, isNotNull: false })}
            className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-600"
          >
            <HiOutlinePlus /> Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {entity.columns?.map((col) => (
            <div key={col.id} className="border rounded-md p-2 dark:border-gray-700 space-y-1">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 px-2 py-1 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  value={col.name}
                  onChange={(ev) => onUpdateColumn(entity.id, col.id, { name: ev.target.value })}
                  placeholder="Column name"
                />
                <select
                  className="px-2 py-1 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  value={col.dataType}
                  onChange={(ev) => onUpdateColumn(entity.id, col.id, { dataType: ev.target.value })}
                >
                  {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => onDeleteColumn(entity.id, col.id)} className="text-red-400 hover:text-red-600">
                  <HiOutlineTrash />
                </button>
              </div>
              <div className="flex gap-3 text-xs text-gray-500">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={col.isPrimaryKey} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isPrimaryKey: ev.target.checked })} /> PK
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={col.isNotNull} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isNotNull: ev.target.checked })} /> NOT NULL
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={col.isUnique} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isUnique: ev.target.checked })} /> UNIQUE
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={col.isForeignKey} onChange={(ev) => onUpdateColumn(entity.id, col.id, { isForeignKey: ev.target.checked })} /> FK
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

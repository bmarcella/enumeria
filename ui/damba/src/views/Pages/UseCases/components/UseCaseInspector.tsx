import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';

type Scenario = { id: string; title: string; content: string; type: string };

type SelectedItem =
  | { kind: 'actor'; id: string; name: string; actorType: string }
  | { kind: 'usecase'; id: string; name: string; role: string; action: string; benefit: string; priority: string; scenarios: Scenario[] }
  | null;

type Props = {
  selected: SelectedItem;
  onUpdateActor: (id: string, data: any) => void;
  onUpdateUseCase: (id: string, data: any) => void;
  onAddScenario: (useCaseId: string) => void;
  onUpdateScenario: (useCaseId: string, scenarioId: string, data: any) => void;
  onDeleteScenario: (useCaseId: string, scenarioId: string) => void;
};

const UseCaseInspector = ({ selected, onUpdateActor, onUpdateUseCase, onAddScenario, onUpdateScenario, onDeleteScenario }: Props) => {
  if (!selected) return (
    <div className="p-4 text-sm text-gray-400 dark:text-gray-500">
      Selectionnez un acteur ou un cas d'utilisation
    </div>
  );

  if (selected.kind === 'actor') {
    return (
      <div className="p-4 space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase">Acteur</h4>
        <div>
          <label className="text-xs text-gray-500">Nom</label>
          <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
            value={selected.name} onChange={(ev) => onUpdateActor(selected.id, { label: ev.target.value })} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Type</label>
          <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
            value={selected.actorType} onChange={(ev) => onUpdateActor(selected.id, { actorType: ev.target.value })}>
            <option value="human">Humain</option>
            <option value="system">Systeme</option>
            <option value="external">Externe</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 overflow-y-auto h-full">
      <h4 className="text-xs font-bold text-gray-500 uppercase">Cas d'utilisation</h4>
      <div>
        <label className="text-xs text-gray-500">Nom</label>
        <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          value={selected.name} onChange={(ev) => onUpdateUseCase(selected.id, { label: ev.target.value })} />
      </div>
      <div>
        <label className="text-xs text-gray-500">En tant que (role)</label>
        <input className="w-full mt-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          value={selected.role || ''} onChange={(ev) => onUpdateUseCase(selected.id, { role: ev.target.value })} />
      </div>
      <div>
        <label className="text-xs text-gray-500">Je veux (action)</label>
        <textarea className="w-full mt-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200" rows={2}
          value={selected.action || ''} onChange={(ev) => onUpdateUseCase(selected.id, { action: ev.target.value })} />
      </div>
      <div>
        <label className="text-xs text-gray-500">Afin de (benefice)</label>
        <textarea className="w-full mt-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200" rows={2}
          value={selected.benefit || ''} onChange={(ev) => onUpdateUseCase(selected.id, { benefit: ev.target.value })} />
      </div>
      <div>
        <label className="text-xs text-gray-500">Priorite</label>
        <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          value={selected.priority} onChange={(ev) => onUpdateUseCase(selected.id, { priority: ev.target.value })}>
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="critical">Critique</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-500 uppercase">Scenarios</label>
          <button onClick={() => onAddScenario(selected.id)} className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-600">
            <HiOutlinePlus /> Ajouter
          </button>
        </div>
        {selected.scenarios?.map((s) => (
          <div key={s.id} className="border rounded-md p-2 dark:border-gray-700 mb-2 space-y-1">
            <div className="flex items-center gap-2">
              <input className="flex-1 px-2 py-1 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                value={s.title} onChange={(ev) => onUpdateScenario(selected.id, s.id, { title: ev.target.value })} placeholder="Titre" />
              <select className="px-2 py-1 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                value={s.type} onChange={(ev) => onUpdateScenario(selected.id, s.id, { type: ev.target.value })}>
                <option value="nominal">Nominal</option>
                <option value="alternative">Alternatif</option>
                <option value="exception">Exception</option>
              </select>
              <button onClick={() => onDeleteScenario(selected.id, s.id)} className="text-red-400 hover:text-red-600"><HiOutlineTrash /></button>
            </div>
            <textarea className="w-full px-2 py-1 border rounded text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200" rows={2}
              value={s.content} onChange={(ev) => onUpdateScenario(selected.id, s.id, { content: ev.target.value })} placeholder="Etapes du scenario..." />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UseCaseInspector;

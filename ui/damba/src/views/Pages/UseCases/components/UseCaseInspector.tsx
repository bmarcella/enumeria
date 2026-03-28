/* eslint-disable @typescript-eslint/no-explicit-any */
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

const inputClass = "w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500";
const labelClass = "text-[9px] font-black uppercase tracking-wider text-slate-500 mb-2 block";

const UseCaseInspector = ({ selected, onUpdateActor, onUpdateUseCase, onAddScenario, onUpdateScenario, onDeleteScenario }: Props) => {
  if (!selected) return (
    <div className="p-6 text-xs text-slate-500">
      Selectionnez un acteur ou un cas d&apos;utilisation
    </div>
  );

  if (selected.kind === 'actor') {
    return (
      <div className="p-6 space-y-6">
        <h4 className="text-[9px] font-black uppercase tracking-wider text-indigo-400">Acteur</h4>
        <div>
          <label className={labelClass}>Nom</label>
          <input className={inputClass} value={selected.name} onChange={(ev) => onUpdateActor(selected.id, { label: ev.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select className={inputClass} value={selected.actorType} onChange={(ev) => onUpdateActor(selected.id, { actorType: ev.target.value })}>
            <option value="human">Humain</option>
            <option value="system">Systeme</option>
            <option value="external">Externe</option>
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h4 className="text-[9px] font-black uppercase tracking-wider text-indigo-400">Cas d&apos;utilisation</h4>
      <div>
        <label className={labelClass}>Nom</label>
        <input className={inputClass} value={selected.name} onChange={(ev) => onUpdateUseCase(selected.id, { label: ev.target.value })} />
      </div>
      <div>
        <label className={labelClass}>En tant que (role)</label>
        <input className={inputClass} value={selected.role || ''} onChange={(ev) => onUpdateUseCase(selected.id, { role: ev.target.value })} />
      </div>
      <div>
        <label className={labelClass}>Je veux (action)</label>
        <textarea className={inputClass} rows={2} value={selected.action || ''} onChange={(ev) => onUpdateUseCase(selected.id, { action: ev.target.value })} />
      </div>
      <div>
        <label className={labelClass}>Afin de (benefice)</label>
        <textarea className={inputClass} rows={2} value={selected.benefit || ''} onChange={(ev) => onUpdateUseCase(selected.id, { benefit: ev.target.value })} />
      </div>
      <div>
        <label className={labelClass}>Priorite</label>
        <select className={inputClass} value={selected.priority} onChange={(ev) => onUpdateUseCase(selected.id, { priority: ev.target.value })}>
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="critical">Critique</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className={labelClass}>Scenarios ({selected.scenarios?.length || 0})</label>
          <button onClick={() => onAddScenario(selected.id)} className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            <HiOutlinePlus className="text-xs" /> Ajouter
          </button>
        </div>
        {selected.scenarios?.map((s) => (
          <div key={s.id} className="border border-slate-800 rounded-lg p-3 bg-slate-900/50 mb-2 space-y-2">
            <div className="flex items-center gap-2">
              <input className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={s.title} onChange={(ev) => onUpdateScenario(selected.id, s.id, { title: ev.target.value })} placeholder="Titre" />
              <select className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={s.type} onChange={(ev) => onUpdateScenario(selected.id, s.id, { type: ev.target.value })}>
                <option value="nominal">Nominal</option>
                <option value="alternative">Alternatif</option>
                <option value="exception">Exception</option>
              </select>
              <button onClick={() => onDeleteScenario(selected.id, s.id)} className="text-slate-600 hover:text-red-400 transition-colors"><HiOutlineTrash className="text-sm" /></button>
            </div>
            <textarea className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" rows={2}
              value={s.content} onChange={(ev) => onUpdateScenario(selected.id, s.id, { content: ev.target.value })} placeholder="Etapes du scenario..." />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UseCaseInspector;

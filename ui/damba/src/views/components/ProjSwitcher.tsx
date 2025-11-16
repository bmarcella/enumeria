/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-children-prop */
import { useMemo } from 'react';
import { useProjectStore, selectProjects, selectProjectId } from '@/stores/useProjectStore';
import { useProjectActions } from '@/stores/useProjectSelectors';
import Select from '@/components/ui/Select';
import AddProject from './AddProject';
import AddProjectForm from '../Form/AddProjectForm';
import { useDialogContext } from '@/providers/DialogProvider';
import { useSessionUser } from '@/stores/authStore';
import { DambaEnvironments } from '../../../../../common/Entity/env';
import useTranslation from '@/utils/hooks/useTranslation';

type Props = { initialized: boolean };
type Option = { value: string; label: string };

export const ProjSwitcher = ({ initialized }: Props) => {
  const projects = useProjectStore(selectProjects);
  const projectId = useProjectStore(selectProjectId);
  const { addProject , setProject , env, setEnv, getCProject } = useProjectActions()
  const { closeDialog } = useDialogContext()
  const user = useSessionUser((state) => state.user);
  const { t } = useTranslation();
  const setUser = useSessionUser((state) => state.setUser)
   const optionsEnv  = DambaEnvironments(t) ; 
  
     
  
  
  const options: Option[] = useMemo(
    () =>
      projects.map((p) => ({
        value: p.id || p.slug || p.name, // fallback if id missing
        label: p.name,
      })),
    [projects, addProject]
  );

  const selected: Option | null = useMemo(
    () => options.find((o) => o.value === projectId) ?? null,
    [options, projectId]
  );

  const selectedEnv: Option | undefined = useMemo(() => {
      const project = getCProject();
      if (!project) return;
      return ({ value: project?.selectedEnv , label: t(project!.selectedEnv!) } as Option)
     }, [selected, optionsEnv ]);

  
const onSubmit = (data:any)=>{
     if (!data.error) {
       closeDialog();
       user.currentProjId = data.project.id;
       setUser(user);
       addProject(data.project);
       setProject(data.project);
     }
}

 const changeEnv = (env: string) => {
    if (!env) return
    setEnv(env);
  }


  if (!initialized) return <div>Loading projects…</div>;
  if (options.length === 0) return (<div className="mr-4 mb-1" >
    <span className="opacity-60 ml-1 text-xs ">
      <AddProject children={<AddProjectForm onSubmit={onSubmit} />} title={'Add Project'} ></AddProject>
    </span>
  </div>);
  return (
    <>
      <div className="mr-4 mb-1">
        {projects && projects.length > 1 ?
          (
            <>
              <span className="opacity-60 ml-1 text-xs ">Project</span>
              <Select
                size="sm"
                placeholder="Please Select"
                options={options}
                value={selected}
                onChange={(opt: Option | null) => setProject(opt?.value ?? '')}
              />
            </>
          ) :
          (
            <>
              <span className="opacity-60 text-xs block">Project</span>{' '}
              <span className="text-sm font-medium">{options[0].label}</span>
            </>
          )
        }
      </div>
       <div className="mr-4 mb-1">
      <span className="opacity-60 text-xs block mb-1">Env.</span>
      {optionsEnv.length > 1 ? (
        <Select
          size="sm"
          placeholder="Select Application"
          options={optionsEnv}
          value={selectedEnv}
          onChange={(opt: Option) => changeEnv(opt.value!)}
        />
      ) : (
        <>
          <span className="text-sm font-medium">{options[0].label}</span>
        </>
      )}
    </div>
    </>

  );
};



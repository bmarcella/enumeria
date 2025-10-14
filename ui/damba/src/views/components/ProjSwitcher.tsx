import { useMemo } from 'react';
import { useProjectStore, selectProjects, selectProjectId } from '@/stores/useProjectStore';
import { useProjectActions } from '@/stores/useProjectSelectors';
import Select from '@/components/ui/Select';
import AddProject from './AddProject';
import AddProjectForm from '../Form/AddProjectForm';

type Props = { initialized: boolean };
type Option = { value: string; label: string };

export const ProjSwitcher = ({ initialized }: Props) => {
  const projects = useProjectStore(selectProjects);
  const projectId = useProjectStore(selectProjectId);
  const { setProject } = useProjectActions()

  const options: Option[] = useMemo(
    () =>
      projects.map((p) => ({
        value: p.id || p.slug || p.name, // fallback if id missing
        label: p.name,
      })),
    [projects]
  );

  const selected: Option | null = useMemo(
    () => options.find((o) => o.value === projectId) ?? null,
    [options, projectId]
  );



  if (!initialized) return <div>Loading projects…</div>;
  if (options.length === 0) return (<div className="mr-4 mb-1" >
    <span className="opacity-60 ml-1 text-xs ">
      <AddProject children={<AddProjectForm />} title={'Add Project'} ></AddProject>
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
    </>

  );
};



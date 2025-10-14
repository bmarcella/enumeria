/* eslint-disable @typescript-eslint/no-unused-vars */
import endpointConfig from "@/configs/endpoint.config";
import { Application, AppModule, FakeOrg, Organization, Project } from "../../../../common/Entity/project";
import ApiService from "./ApiService";

export const fetchOrganizations = (id: string): Promise<Organization[]> => {

   return ApiService.fetchDataWithAxios({
      url: `${endpointConfig.organizations}/${id}/user`,
      method: 'get',
   })
}


export const fetchProject = (idUser: string, idOng: string): Promise<Project[]> => {
   return new Promise<Project[]>((resolver) => {
      const ps = FakeOrg.find((org: Organization) => org.id == idOng);
      if (!ps?.projects) resolver([]);
      resolver(ps?.projects || []);
   });
}



export const fetchApplicationsByProject = (idOrg: string, idProj: string): Promise<Application[]> => {
   return new Promise<Application[]>((resolver) => {

      const project: Project | undefined = FakeOrg?.[0]?.projects?.[0];
      if (!project || !project.applications) resolver([]);

      resolver(project?.applications || []);
   });
}

export const fetchModulesByApplication = (appId: string): Promise<AppModule[]> => {
   // find the application by id across all projects
   const app =
      FakeOrg?.[0]?.projects
         ?.flatMap(p => p.applications ?? [])
         ?.find(a => a.id === appId);

   // return modules or an empty array
   return Promise.resolve(app?.modules ?? []);
};

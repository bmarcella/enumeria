import { CanvasBox, CanvasBoxAtributes, VisibilityTypeAttributes, VisibilityTypeClass } from "./CanvasBox";
import {  AppModule, Service } from "./project";
import { TypeAttbutesTypeOrm } from "./TypeAttributesTypeOrm";


  export const  DambaModuleTemplate : AppModule =  {
          id: "",
          name: "Demo Module",
          description: "This is a demo Module",
          type: "feature",
          version: "1.0.0",
          status: "active",
          ownerId: "",
          dependencies: [],
          repoPath: "",
          packageName: "",
          services: []
    }

    export const DambaServiceTemplate : Service =  {
      applicationId: "",
      projectId: "",
      orgId: ""
    }

export const DambaEntityTemplate: CanvasBox =  {
                  id: "",
                  entityName: "demo Entity",
                  attributes: [],
};

export const DambaAttributesTemplate : CanvasBoxAtributes  = {
  id: '1',
  name: "demo attributes",
  type: TypeAttbutesTypeOrm.UUID,
  visibility: VisibilityTypeAttributes.IMPLEMENTATION,
  isMapped: false,
  isParent: false
};
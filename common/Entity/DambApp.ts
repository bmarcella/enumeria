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
          contributors: [],
          dependencies: [],
          repoPath: "",
          packageName: "",
          environments: {
            dev: "",
            prod: ""
          },
          services: []
    }

    export const DambaServiceTemplate : Service =   {
              id: '',
              name: 'Demo service',
              kind: 'api',
              language: 'typescript',
              runtime: 'node18',
              framework: 'nest',
              version: '1.3.0',
              endpoint: 'https://api.example.com/payroll',
              openapiUrl: 'https://api.example.com/payroll/openapi.json',
              eventsEmitted: ['invoice.created', 'payout.requested'],
              eventsConsumed: ['employee.updated'],
              queues: ['payroll-jobs'],
              topics: ['hr-events'],
              databaseIds: ['db_payroll'],
              externalDeps: ['svc_auth', 'svc_ledger'],
              scaling: { min: 1, max: 5, targetCPU: 70 },
              resources: { cpu: '500m', memory: '512Mi' },
              telemetry: { logs: 'log/payroll', metrics: 'dash/payroll', traces: 'svc-payroll' },
              status: 'active',
              canvasBoxes: []
            }

export const DambaEntityTemplate: CanvasBox =  {
                  id: "",
                  entityName: "demo Entity",
                  attributes: [],
                  visibility: VisibilityTypeClass.PUBLIC
};

export const DambaAttributesTemplate : CanvasBoxAtributes  = {
  id: '1',
  name: "demo attributes",
  type: TypeAttbutesTypeOrm.UUID,
  visibility: VisibilityTypeAttributes.IMPLEMENTATION,
  isMapped: false,
  isParent: false
};
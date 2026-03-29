export enum CreateProjectStep {
  // Step 1: Project + Applications
  PROJECT_CREATED = "Project created",
  APPLICATIONS_GENERATED = "Applications generated",

  // Step 2: Entities
  ENTITIES_GENERATED = "Entities generated",

  // Step 3: Modules
  MODULES_GENERATED = "Modules generated",

  // Step 4: Services
  SERVICES_GENERATED = "Services generated",

  // Step 5: Validators
  GLOBAL_VALIDATORS_GENERATED = "Global validators generated",

  // Step 6: Middlewares & Policies
  GLOBAL_MIDDLEWARES_GENERATED = "Global middlewares generated",

  // Step 7: Behaviors & Extras
  BEHAVIORS_EXTRAS_GENERATED = "Behaviors & Extras generated",

  // Step 8: App files
  APP_FILES_GENERATED = "App files generated",

  // Step 9: Damba common
  DAMBA_COMMON_FILES_LOADED = "Damba common files loaded",

  DONE = "Done",
}

/**
 * Pipeline step identifiers used as queue suffixes.
 * Each step is a separate BullMQ job the user must trigger after validating the previous step's output.
 */
export enum PipelineStep {
  /** Step 1: Create project metadata + determine applications */
  PROJECT_AND_APPS = "project_and_apps",
  /** Step 2: Generate domain entities for all services */
  ENTITIES = "entities",
  /** Step 3: Generate modules per application */
  MODULES = "modules",
  /** Step 4: Generate services per module */
  SERVICES = "services",
  /** Step 5: Generate Zod validators from entities */
  VALIDATORS = "validators",
  /** Step 6: Generate global middlewares and policies */
  MIDDLEWARES_POLICIES = "middlewares_policies",
  /** Step 7: Generate behaviors (endpoints) and extras (hooks) */
  BEHAVIORS_EXTRAS = "behaviors_extras",
  /** Step 8: Generate app-level config files */
  APP_FILES = "app_files",
  /** Step 9: Load Damba framework files */
  DAMBA_COMMON = "damba_common",
}

/** Ordered list of pipeline steps */
export const PIPELINE_ORDER: PipelineStep[] = [
  PipelineStep.PROJECT_AND_APPS,
  PipelineStep.ENTITIES,
  PipelineStep.MODULES,
  PipelineStep.SERVICES,
  PipelineStep.VALIDATORS,
  PipelineStep.MIDDLEWARES_POLICIES,
  PipelineStep.BEHAVIORS_EXTRAS,
  PipelineStep.APP_FILES,
  PipelineStep.DAMBA_COMMON,
];

/** Returns the next step after the given one, or undefined if done */
export const nextStep = (current: PipelineStep): PipelineStep | undefined => {
  const idx = PIPELINE_ORDER.indexOf(current);
  return idx >= 0 && idx < PIPELINE_ORDER.length - 1
    ? PIPELINE_ORDER[idx + 1]
    : undefined;
};

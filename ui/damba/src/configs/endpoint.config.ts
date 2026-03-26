export const apiPrefix = ''

const endpointConfig = {
    signIn: '/sign-in',
    signOut: '/auth/logout',
    signUp: '/sign-up',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    signInWithGoogle: '/auth/google/exchange',

    // SERVICES
    organizations: '/organizations',
    projects: '/projects',
    entities: '/entities',
    applications: '/applications',
    users: '/users',
    modules: '/modules',
    services: '/services',
    auth: '/auth',
    behavior: '/behavior',
    helper: '/helper',
    // AGENTS 
   agentDefinitions: "/agent_definitions",
   agentCatalog: "/agent_catalog",
   agentListings: "/agent_listings",
   agentLicenses: "/agent_licenses",
   agentAssignments: "/agent_assignments",
   toolArtifacts: "/tool_artifacts",
   runnableLambdas: "runnable-lambdas",
   // DATA MODELER
   dataModelerEntities: "/data-modeler/entities",
   dataModelerRelationships: "/data-modeler/relationships",
   // USE CASES
   useCases: "/use-cases",
   useCaseActors: "/use-cases/actors",
   useCaseRelationships: "/use-cases/relationships",
   // WORKSPACE
   workspace: "/workspace",
   // PROJECT ACCESS
   projectAccess: "/project-access",
}

export default endpointConfig

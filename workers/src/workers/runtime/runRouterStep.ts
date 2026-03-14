/* eslint-disable @typescript-eslint/no-explicit-any */
export async function runRouterStep(opts: {
  router: {
    prompt: string;
    routes: Record<string, string>;
  };
  input: any;
  agentCtx: any;
  callModel: (args: {
    systemPrompt: string;
    input: any;
    allowedRoutes: string[];
  }) => Promise<string>;
}) {
  const { router, input, callModel } = opts;

  const allowedRoutes = Object.keys(router.routes);

  const selectedRoute = await callModel({
    systemPrompt: router.prompt,
    input,
    allowedRoutes,
  });

  const subAgentId = router.routes[selectedRoute];
  if (!subAgentId) {
    throw new Error(`Router selected invalid route: ${selectedRoute}`);
  }

  return subAgentId;
}
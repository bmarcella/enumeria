const testBehaviorExample = `
export const testBehavior: DEventHandlerFactory = (api?: DambaApi) => {
  return async (e: DEvent) => {
  // Access input parameter 'param'
   const params = e.in.params().param;
   const p2 = api.extras.service_name.extraMethod();
    // Send response with the retrieved parameter
    e.out.send(params);
    
  };
};`;
export default testBehaviorExample;

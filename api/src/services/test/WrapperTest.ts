
// import { BehaviorsChainLooper, createDambaService, DambaApi, DambaService } from "@Damba/v2/service/DambaService";
// import { Http } from "@Damba/v2/service/IServiceDamba";
// import { DEvent } from "@Damba/v2/service/DEvent";
// import { Behavior } from "@Damba/v2/Entity/behavior";

// const service = {
//     name : "/service_name",
//     entity: {type_orm_entity}
    
// } as DambaService

// export const exampleBehavior : Behavior = (api?: DambaApi) => {
//   return async (e: DEvent) => {
//     // Save
//     api?.DSave(entity)
//     api?.DDelete({})
//     api?.DGet({
//         where: {
//             key: value 
//         }
//     })
//     e.out.send();
//   };
// };

// const behaviors: BehaviorsChainLooper = {
//   "/endpoint" : {
//       method: Http.POST,
//       behavior: exampleBehavior,
//       config: {
//         validators : {
//             body : {zod_validator},
//             query: {zod_validator},
//             params: {zod_validator}
//         }
//       }
//   }
// };

// export default  createDambaService( { service, behaviors } ) ;




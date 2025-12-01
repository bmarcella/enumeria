import { createBehaviors, DEvent } from "../../Damba/service/v1/DambaService";
import { Project } from "../Projects/entities/Project";

const api = createBehaviors("/useExtra", Project);



api.DGet("/home", (e: DEvent) => {
   e.out.send(e.in?.extras.test.getName());
},)



export default api.done();
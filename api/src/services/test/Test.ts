/* eslint-disable @typescript-eslint/no-unused-vars */
import { createBehaviors, DEvent } from "../../Damba/service/v1/DambaService";
import { Project } from "../Projects/entities/Project";

const api = createBehaviors("/test", Project);



api.DGet("/home", (e: DEvent) => {
    e.out.send(api.data());
}, {
    getName: ()=>{
        return "Asgard"
    }
})

api.DGet("/id_projects", (e: DEvent) => {
   console.log(e.in.extras)
   e.out.send(e.in?.extras.canvasboxes.getCBName());
}, {
    getName: ()=> {
        return "Asgard"
    }
})



export default api.done();
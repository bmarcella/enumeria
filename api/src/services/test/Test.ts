import { createBehaviors, DEvent } from "../../Damba/service/DambaService";
import { Project } from "../Projects/entities/Project";

const api = createBehaviors("/test", Project);



api.DGet("/home", (e: DEvent) => {
   console.log(e.in.extras)
   e.out.send(e.in?.extras.canvasboxes.getCBName());
}, {
    getName: ()=>{
        return "Asgard"
    }
})



export default api.done();
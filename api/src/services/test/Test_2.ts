
import { createService, DEvent } from "@App/damba.import";
import { Project } from "../Projects/entities/Project";

const api = createService("/useExtra", Project);

api.DGet("/home", (e: DEvent) => {
   e.out.send(e.in?.extras.test.getName());
},)



export default api.done();
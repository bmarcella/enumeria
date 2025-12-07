/* eslint-disable @typescript-eslint/no-unused-vars */
import { createService, DEvent } from "@App/damba.import";
import { Project } from "../Projects/entities/Project";

const api = createService("/test", Project);

api.DGet("/home", (e: DEvent) => {
    e.out.send({
        name: "home"
    });
}, {
    getName: () => {
        return "Asgard"
    }
}, [], {
    description: "Ceci est un test",
    timeout: 300
})

api.DGet("/id_projects", (e: DEvent) => {
    console.log(e.in.extras)
    e.out.send(e.in?.extras.canvasboxes.getCBName());
}, {
    getName: () => {
        return "Asgard"
    }
})



export default api.done();
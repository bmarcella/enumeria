import { createBehaviors, DEvent } from '../../Damba/service/DambaService';
const api = createBehaviors('/canvasboxes');
api.DGet('/:idServ/service',   async (e: DEvent) => {
    // yourcode here
    return e.out.json();
}, {
     getCBName: ()=>{
        return "CanvasBox"
    }
})
export default api.done();
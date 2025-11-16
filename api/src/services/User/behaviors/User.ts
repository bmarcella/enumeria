/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from'../entities/User';
import { createBehaviors, DEvent } from '../../../Damba/service/DambaService';
const api = createBehaviors('/user', User);
api.DGet('/:idServ/service',   async (e: DEvent) => {
    // yourcode here
    return e.out.json();
}, {
     setCurrentProject: (idUser, idProject, e: DEvent)=>{
        e.in.DRepository.DUpdate(User, {
            id: idUser
        }, {
            currentProjId: idProject
        })
    }
})
export default api.done();
import { createService } from '@App/damba.import';
import getAllInvitaion from './GetAllInvitation';

const api = createService('/invitations');

api.DGet('/path', getAllInvitaion, {}, [], {});
export default api.done();

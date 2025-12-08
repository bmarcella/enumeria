import { createService } from "@App/damba.import";
import getAllInvitaion from "./GetAllInvitation";

const api = createService("/invitations");

api.DGet("/", getAllInvitaion, {}, [], {});
export default api.done();

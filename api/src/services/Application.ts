import { createService, DEvent } from "../Damba/service/DambaService";
import { ErrorMessage } from "../../../common/error/error";

const api = createService("/applications");
api.DGet("/:id/user", async (e: DEvent) => {
    const userId = e.in.session.user?.id || "de300fce-3435-4341-9f59-bb1b723f1cda";
    if (!userId) return e.out.status(401).json({ error: ErrorMessage });
    return e.out.json(userId);
}, {})

export default api.done();
import M1Service1 from "..";
import GetUserExtras from "./GetUser/Extras";
import GetUserBehavior from "./GetUser/GetUserBehavior";
import GetUserMiddlewares from "./GetUser/Middleware/Index";

M1Service1.DGet("path", GetUserBehavior, GetUserExtras, GetUserMiddlewares)

const M1Service1Api = M1Service1.done();
export default M1Service1Api;
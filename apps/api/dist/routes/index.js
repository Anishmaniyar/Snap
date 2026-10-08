import { Router } from "express";
import authRouter from "../modules/auth/auth.routes.js";
import urlRouter from "../modules/url/url.routes.js";
const RootRouter = Router();
RootRouter.use("/auth", authRouter);
RootRouter.use("/urls", urlRouter);
export default RootRouter;
//# sourceMappingURL=index.js.map
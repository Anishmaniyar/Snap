import { Router } from "express";
import * as authController from "./auth.controller.js";
import * as authSchemaValidator from "./auth.schema.js";
import { validateRequest } from "../../middleware/validation.middleware.js";
const authRouter = Router();
authRouter.post("/signup", validateRequest(authSchemaValidator.signupSchema), authController.signup);
authRouter.post("/login", validateRequest(authSchemaValidator.loginSchema), authController.login);
authRouter.post("/logout", authController.logout);
export default authRouter;
//# sourceMappingURL=auth.routes.js.map
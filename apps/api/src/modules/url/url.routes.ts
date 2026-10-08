import { Router } from "express";
import * as urlController from "./url.controller.js";
import * as urlSchemaValidator from "./url.schema.js";
import { validateRequest } from "../../middleware/validation.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const urlRouter = Router();

urlRouter.post(
  "/",
  authenticate,
  validateRequest(urlSchemaValidator.createUrlSchema),
  urlController.shortUrl,
);

urlRouter.get("", authenticate, urlController.getUserUrls);

urlRouter.get(
  "/:id",
  authenticate,
  validateRequest(urlSchemaValidator.getUrlByIdSchema),
  urlController.getUrlById,
);

urlRouter.patch(
  "/:id",
  authenticate,
  validateRequest(urlSchemaValidator.updateUrlById),
  urlController.updateUrlById,
);

urlRouter.delete(
  "/:id",
  authenticate,
  validateRequest(urlSchemaValidator.deleteUrlById),
  urlController.deleteUrlById,
);

export default urlRouter;

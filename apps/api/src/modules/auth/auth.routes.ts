import { Router } from "express";

export const authRouter = Router();

// TODO: POST /signup -> validate(signup schema) -> authController.signup
// TODO: POST /login  -> validate(login schema)  -> authController.login
// TODO: POST /logout -> authController.logout (clears refresh-token cookie)

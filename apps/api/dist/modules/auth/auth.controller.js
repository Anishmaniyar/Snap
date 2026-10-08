import asyncHandler from "../../lib/asyncHandler.js";
import * as authService from "./auth.service.js";
export const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const result = await authService.signup(name, email, password);
    res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: result,
    });
});
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
        status: "success",
        message: "User logged in successfully",
        data: result,
    });
});
export const logout = asyncHandler(async (_req, res) => {
    const result = await authService.logout();
    res.status(200).json({
        status: "success",
        message: result.message,
    });
});
//# sourceMappingURL=auth.controller.js.map
import { Router } from "express";
import { register, login, logout, sendOTP } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/otp", sendOTP);
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

export { authRouter };

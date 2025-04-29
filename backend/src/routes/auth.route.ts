import { Router } from "express";
import { register, login, logout, sendOTP } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/otp", sendOTP);
authRouter.get("/register", register); // /register?otp=1234&email=abc@gmail.com
authRouter.post("/login", login);
authRouter.post("/logout", logout);

export { authRouter };

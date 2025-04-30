import { Router } from "express";
import { register, login, logout, sendOTP } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.put("/otp", sendOTP);
authRouter.post("/register", register); // ?otp=1234
authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);

export { authRouter };

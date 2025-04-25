import { Router } from "express";
import { register, login, logout } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.use("/register", register);
authRouter.use("/login", login);
authRouter.use("/logout", logout);

export { authRouter };

import { Router } from "express";
import {
  register,
  login,
  logout,
  sendOTP,
  refreshToken,
  deleteUser,
  resetPassword,
  forgotPassword,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.put("/otp", sendOTP);
authRouter.post("/register", register); // ?otp=1234
authRouter.post("/login", login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.post("/refresh", refreshToken);
authRouter.delete("/delete", deleteUser);
authRouter.post("/forgot-pass", forgotPassword);
authRouter.post("/reset-pass", resetPassword);

export { authRouter };

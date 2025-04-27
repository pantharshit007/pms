import { Request, Response } from "express";
import { apiResponse } from "../utils/api-response";

async function register(req: Request, res: Response) {
  console.log(req.body);
  return apiResponse({
    res: res,
    success: true,
    status: 200,
    message: "Registered successfully",
    data: null,
  });
}

async function login(req: Request, res: Response) {
  return apiResponse({
    res: res,
    success: true,
    status: 200,
    message: "Logged in successfully",
    data: null,
  });
}

async function logout(req: Request, res: Response) {
  return apiResponse({
    res: res,
    success: true,
    status: 200,
    message: "Logged out successfully",
    data: null,
  });
}

export { register, login, logout };

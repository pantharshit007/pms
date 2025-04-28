import { Response } from "express";

class ApiResponse<T> {
  res: Response;
  status: number;
  success: boolean;
  message: string;
  data?: T;

  constructor(res: Response, success: boolean, status: number, message: string, data?: T) {
    this.res = res;
    this.success = success;
    this.status = status;
    this.message = message;
    this.data = data;
  }

  send() {
    this.res.status(this.status).json({
      success: this.success,
      message: this.message ?? "Something went wrong",
      data: this.data ?? null,
    });
  }
}

export type ApiResponseType<T> = {
  res: Response;
  success: boolean;
  status: number;
  message: string;
  data?: T;
};

/**
 * This function is used to send a response with the given parameters
 * @param res - The response object
 * @param success(boolean) - Whether the request was successful or not
 * @param status(number) - The HTTP status code
 * @param message(string) - The error message
 * @param data - The data to be sent in the response
 */
export const apiResponse = <T>({
  res,
  success,
  status,
  message,
  data,
}: ApiResponseType<T>): void => {
  return new ApiResponse<T>(res, success, status, message, data).send();
};

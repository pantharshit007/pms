/**
 * This class extends the built-in Error class and adds a status property to it
 * @param status - The HTTP status code associated with the error
 * @param message - The error message
 */
class CustomError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

export { CustomError };

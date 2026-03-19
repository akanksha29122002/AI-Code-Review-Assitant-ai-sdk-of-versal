import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred.";
}

export function getErrorStatusCode(error: unknown) {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error instanceof ZodError) {
    return 400;
  }

  return 500;
}

export function getErrorDetails(error: unknown) {
  if (error instanceof AppError) {
    return error.details;
  }

  if (error instanceof ZodError) {
    return error.flatten();
  }

  return undefined;
}

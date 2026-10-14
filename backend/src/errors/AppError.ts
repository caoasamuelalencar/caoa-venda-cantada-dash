export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export function badRequest(message: string) {
  return new AppError(message, 400);
}

export function notFound(message: string) {
  return new AppError(message, 404);
}

export function unauthorized(message: string) {
  return new AppError(message, 401);
}

export function forbidden(message: string) {
  return new AppError(message, 403);
}

export function serviceUnavailable(message: string) {
  return new AppError(message, 503);
}

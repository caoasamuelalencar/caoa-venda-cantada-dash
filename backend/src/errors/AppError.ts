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

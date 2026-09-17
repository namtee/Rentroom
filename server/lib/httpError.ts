export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = 'HTTP_ERROR',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function notFound(message = 'ไม่พบข้อมูลที่ต้องการ'): never {
  throw new HttpError(404, message, 'NOT_FOUND');
}

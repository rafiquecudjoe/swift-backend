export interface CaughtError {
  code?: number | string | null;
  message: string;
}

export interface RequestResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
}

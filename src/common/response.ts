/**
 * Static response builder class
 * Standardizes API responses across all endpoints
 */
export class Response {
  static withoutData(status: number, message: string) {
    return { status, message };
  }

  static withData<T = unknown>(status: number, message: string, data: T) {
    return { status, message, data };
  }
}

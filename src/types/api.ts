/**
 * Shape returned by every oncre-backend controller via `JsonResponse`/`ErrorResponse`
 * (see src/handlers/responses/index.ts in oncre-backend).
 */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Shape of `data` for paginated list endpoints, which call `findAndCount`/`aggregateAndCount`
 * (see src/repository/base.repository.ts in oncre-backend).
 */
export interface ListResult<T> {
  row: T[];
  count: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

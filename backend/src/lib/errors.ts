import { COMMON_ERROR_CODES, type CommonErrorCode, type DocumentErrorCode } from "@suretyseven/shared";

// Extend this union as new features add their own codes in shared/src/<feature>/exceptions.ts.
type KnownErrorCode = CommonErrorCode | DocumentErrorCode;

export class AppError extends Error {
  constructor(
    public readonly code: KnownErrorCode,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Never leak raw error/stack details to the client — map to a generic envelope, log server-side.
export function toErrorResponse(err: unknown): { statusCode: number; body: { error: { code: string; message: string } } } {
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, body: { error: { code: err.code, message: err.message } } };
  }
  return {
    statusCode: 500,
    body: {
      error: { code: COMMON_ERROR_CODES.INTERNAL_ERROR, message: "Something went wrong. Please try again." },
    },
  };
}

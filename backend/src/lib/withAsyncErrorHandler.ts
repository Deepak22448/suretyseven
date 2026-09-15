import { NextFunction, Request, Response } from "express";

// Routes thrown/rejected errors to Express's error handler instead of hanging or crashing.
export function withAsyncErrorHandler(fn: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}

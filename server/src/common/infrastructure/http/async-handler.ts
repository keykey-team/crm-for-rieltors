import { NextFunction, Request, RequestHandler, Response, Router } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => unknown | Promise<unknown>;

export function asyncHandler(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createAsyncRouter(): Router {
  const router = Router();

  (['get', 'post', 'put', 'delete', 'patch'] as const).forEach((method) => {
    const original = (router as any)[method].bind(router);
    (router as any)[method] = (path: any, ...handlers: RequestHandler[]) =>
      original(path, ...handlers.map((handler) => (handler.length === 4 ? handler : asyncHandler(handler))));
  });

  return router;
}

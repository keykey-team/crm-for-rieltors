import { Response } from 'express';

export abstract class BaseController {
  protected ok<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json(data);
  }
}

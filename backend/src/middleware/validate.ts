// @app/middleware/validate.ts
import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body.data);

    if (!result.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: result.error.format(),
      });
    }
    req.body.data = result.data;
    next();
  };
}

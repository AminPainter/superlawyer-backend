import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { requestContextStorage } from 'src/logging/request-context';

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const headerId = req.headers['x-request-id'];
  const incoming = Array.isArray(headerId) ? headerId[0] : headerId;
  const requestId = incoming && incoming.length > 0 ? incoming : randomUUID();
  res.setHeader('x-request-id', requestId);
  requestContextStorage.run({ requestId }, () => next());
}

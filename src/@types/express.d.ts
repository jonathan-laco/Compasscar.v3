import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // ou você pode definir um tipo específico para 'user'
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { createOrderSchema } from './order.validation';

export const validateOrderCreation = (req: Request, res: Response, next: NextFunction) => {
  const { error } = createOrderSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }
  next();
};
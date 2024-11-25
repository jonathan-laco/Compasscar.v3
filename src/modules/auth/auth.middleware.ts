//auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extensões da interface Request para adicionar a propriedade 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token not provided.' }); 
    return; 
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      res.status(403).json({ error: 'Invalid token.' }); 
      return; 
    }


    req.user = user; 
    next(); 
  });
};

export { authenticateToken };

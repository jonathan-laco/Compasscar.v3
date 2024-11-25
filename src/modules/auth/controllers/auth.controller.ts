//auth.controller
import { Request, Response, NextFunction } from 'express';
import { authenticateUser } from '../services/auth.service';
import { loginSchema } from '../auth.validation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
   
    const { error } = loginSchema.validate(req.body);

    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return; 
    }

    const { email, password } = req.body;


    const token = await authenticateUser(email, password);

    if (!token) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(404).json({ message: 'Email not found' });
      } else {
        res.status(401).json({ message: 'Invalid password' }); 
      }
      return;
    }

    res.status(200).json({ token });
  } catch (err) {
    if (err instanceof Error) {
      switch (err.message) {
        case 'Invalid email format':
          res.status(400).json({ message: 'Invalid email format' });
          break;
        case 'User does not exist':
          res.status(404).json({ message: 'Email not found' });
          break;
        case 'User is deleted':
          res.status(403).json({ message: 'User is deleted' });
          break;
        case 'Invalid password':
          res.status(401).json({ message: 'Invalid password' });
          break;
        default:
          res.status(500).json({ message: 'An unexpected error occurred: ' + err.message });
      }
    } else {
      res.status(500).json({ message: 'An unexpected error occurred.' });
    }
  }
};

export { login };

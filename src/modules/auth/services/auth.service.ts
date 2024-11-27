// auth.service.ts

import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';  // Mudou para bcryptjs
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

// Função para validar e-mail
const validateEmail = (email: string): boolean => {
  const emailSchema = Joi.string().email();
  const { error } = emailSchema.validate(email);
  return !error;
};

const authenticateUser = async (email: string, password: string): Promise<string | null> => {
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  const user: User | null = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User does not exist');
  }

  if (user.deletedAt) {
    throw new Error('User is deleted');
  }

  // Agora usamos o bcryptjs
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '10m' });
  
  return token;
};

export { authenticateUser };

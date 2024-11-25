// src/__tests__/auth.test.ts
import request from 'supertest';
import app from '../app'; // Ajuste o caminho conforme necessário
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Criando um usuário de teste
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10), // Use bcrypt para hashear a senha
        fullName: 'Admin User', // Inclua o campo 'fullName' se necessário
      },
    });
  });

  afterAll(async () => {
    // Limpeza após os testes
    await prisma.user.deleteMany({
      where: {
        email: 'admin@example.com',
      },
    });
    await prisma.$disconnect();
  });

  it('should authenticate the admin user and return a token', async () => {
    const response = await request(app)
      .post('/auth/login') // Altere o caminho se necessário
      .send({ email: 'admin@example.com', password: 'admin123' });

    console.log('Login Response:', response.body); // Para depuração
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    // Armazena o token para uso em outros testes
    const token = response.body.token;

    // Verifica se o token é válido
    expect(token).toBeDefined();
  });

  it('should access a private route with a valid token', async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'admin123' });
    
    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/admin/test') // Altere o caminho se necessário
      .set('Authorization', `Bearer ${token}`);

    console.log('Private Route Response:', response.body); // Para depuração
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Welcome to the admin route!', // Altere para a resposta esperada
      user: expect.objectContaining({
        email: 'admin@example.com',
      }),
    });
  });

  it('should not authenticate with incorrect credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'senhaErrada' });

    console.log('Login Response:', response.body); // Para depuração
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid password' });
  });

  it('should not access a private route without a token', async () => {
    const response = await request(app)
      .get('/admin/test'); // Altere o caminho se necessário

    console.log('Private Route Response:', response.body); // Para depuração
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Token not provided.' });
  });

  it('should not access a private route with an invalid token', async () => {
    const response = await request(app)
      .get('/admin/test')
      .set('Authorization', 'Bearer invalidtoken');

    console.log('Private Route Response:', response.body); // Para depuração
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Invalid token.' });
  });
});

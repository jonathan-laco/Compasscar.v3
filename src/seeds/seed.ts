import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';  // Usando bcryptjs em vez de bcrypt

const prisma = new PrismaClient();

async function main() {
  // Criptografar a senha do admin
  const hashedPassword = await bcrypt.hash('admin123', 10);  // Usando bcryptjs para hash

  // Criar usuário Admin
  await prisma.user.create({
    data: {
      fullName: 'Admin Teste',
      email: 'admin@example.com',
      password: hashedPassword,
      Role: 'ADMIN',
    },
  });

  /* Criar cliente
  await prisma.client.create({
    data: {
      fullName: 'Cliente Teste',
      cpf: '12345678909',
      email: 'cliente@example.com',
      birthDate: new Date('2000-01-01'),
      phone: '123456789',
    },
  });
  */
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

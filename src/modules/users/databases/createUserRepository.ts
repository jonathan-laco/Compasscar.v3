import { Role } from "@prisma/client";
import { prisma } from "../../../config/prismaClient";

interface CreateUserInterface {
  fullName: string;
  email: string;
  password: string;
  Role: Role;
}

class CreateUserRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: CreateUserInterface) {
    return prisma.user.create({
      data,
    });
  }
}

export default new CreateUserRepository();

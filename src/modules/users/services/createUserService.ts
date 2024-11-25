import { Role } from "@prisma/client";
import CreateUserRepository from "../databases/createUserRepository";
import bcrypt from "bcrypt";

interface CreateUserInterface {
  fullName: string;
  email: string;
  password: string;
  Role: Role;
}

class CreateUserService {
  async createUser(data: CreateUserInterface) {
    const { email, password } = data;

    const existingUser = await CreateUserRepository.findUserByEmail(email);
    if (existingUser && !existingUser.deletedAt) {
      throw new Error("E-mail já está em uso.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await CreateUserRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    return user;
  }
}

export default new CreateUserService();

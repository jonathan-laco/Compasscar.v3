import { Role } from "@prisma/client";
import CreateUserRepository from "../databases/createUserRepository";
import bcrypt from "bcryptjs";

interface CreateUserInterface {
  fullName: string;
  email: string;
  password: string;
  Role?: Role;
}

class CreateUserService {
  async createUser(data: CreateUserInterface) {
    const { email, password } = data;

    //Role opcional para USER, para admin é necessário passar a Role como ADMIN
    const role = data.Role || Role.USER;

    const existingUser = await CreateUserRepository.findUserByEmail(email);
    if (existingUser && !existingUser.deletedAt) {
      throw new Error("E-mail já está em uso.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await CreateUserRepository.createUser({
      ...data,
      Role: role,
      password: hashedPassword,
    });

    return user;
  }
}

export default new CreateUserService();

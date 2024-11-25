import { prisma } from "../../../config/prismaClient";
import GetUserByIdRepository from "../databases/getIdUserRepository";

interface GetUserByIdInterface {
  id: string;
}

interface UserResponseInterface {
  id: string;
  fullName: string;
  email: string;
  Role: string;
}

class GetUserByIdService {
  static async execute({
    id,
  }: GetUserByIdInterface): Promise<UserResponseInterface | null> {
    const user = await GetUserByIdRepository.getById({ id });
    return user;
  }
}

export default GetUserByIdService;

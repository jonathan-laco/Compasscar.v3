import { prisma } from "../../../config/prismaClient";

interface GetUserByIdInterface {
  id: string;
}

interface UserResponseInterface {
  id: string;
  fullName: string;
  email: string;
  Role: string;
}

class GetUserByIdRepository {
  static async getById({
    id,
  }: GetUserByIdInterface): Promise<UserResponseInterface | null> {
    return prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        Role: true,
        createdAt: true,
      },
    });
  }
}

export default GetUserByIdRepository;

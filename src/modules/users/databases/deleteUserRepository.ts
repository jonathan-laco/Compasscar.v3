import { prisma } from "../../../config/prismaClient";

class deleteUserRepository {
  static async getUserId(id: string) {
    return await prisma.user.findFirst({
      where: { id },
    });
  }

  static async deleteUser(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export default deleteUserRepository;

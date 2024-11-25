import { prisma } from "../../../config/prismaClient";

interface UpdateUserInterface {
  fullName?: string;
  email?: string;
  password?: string;
}

class UpdateUserRepository {
  static async updateUser(id: string, data: UpdateUserInterface) {
    const user = await prisma.user.findFirst({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const usedEmail = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (usedEmail) {
      throw new Error("Email");
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export default UpdateUserRepository;

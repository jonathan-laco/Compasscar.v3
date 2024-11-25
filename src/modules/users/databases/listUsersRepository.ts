import { Role } from "@prisma/client";
import { prisma } from "../../../config/prismaClient";

interface listUsersInterface {
  fullName?: string;
  email?: string;
  isDeleted?: boolean;
  sortBy?: "fullName" | "createdAt" | "deletedAt";
  sortOrder: "asc" | "des";
  page?: number;
  perPage?: number;
  Role: string;
}

class ListUsersRepository {
  static async listUsers({
    fullName,
    email,
    isDeleted,
    sortBy,
    sortOrder,
    page = 1,
    perPage = 10,
  }: listUsersInterface) {
    const where: any = {};

    if (fullName) where.fullName = { contains: fullName };
    if (email) where.email = { contains: email };
    if (isDeleted !== undefined)
      where.deletedAt = isDeleted ? { not: null } : null;

    const skip = (page - 1) * perPage;

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        [sortBy || "fullName"]: sortOrder,
      },
      skip,
      take: perPage,
      select: {
        id: true,
        fullName: true,
        email: true,
        Role: true,
        createdAt: true,
        deletedAt: isDeleted ? true : false,
      },
    });

    const total = await prisma.user.count({ where });

    return {
      users,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }
}

export default ListUsersRepository;

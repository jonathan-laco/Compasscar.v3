import ListUsersRepository from "../databases/listUsersRepository";

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

class ListUsersService {
  static async execute(params: listUsersInterface) {
    const result = await ListUsersRepository.listUsers(params);
    return result;
  }
}

export default ListUsersService;

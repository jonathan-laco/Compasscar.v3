import bcrypt from "bcryptjs"; // Substituindo bcrypt por bcryptjs
import UpdateUserRepository from "../databases/updateUserRepository";

interface UpdateUserInterface {
  fullName?: string;
  email?: string;
  password?: string;
}

class UpdateUserService {
  static async updateUser(id: string, data: UpdateUserInterface) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10); // Usando bcryptjs para hash
    }
    const updatedUser = await UpdateUserRepository.updateUser(id, data);
    return updatedUser;
  }
}

export default UpdateUserService;

import { Request, Response } from "express";
import createUserService from "../services/createUserService";
import { validationResult } from "express-validator";
import GetUserByIdService from "../services/getIdUserService";
import ListUsersService from "../services/listUsersService";
import UpdateUserService from "../services/updateUserService";
import deleteUserService from "../services/deleteUserService";

class UserController {
  async createUser(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((error) => error.msg),
      });
    }

    const { fullName, email, password, Role } = req.body;

    try {
      const user = await createUserService.createUser({
        fullName,
        email,
        password,
        Role,
      });
      return res.status(201).json(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      } else {
        return res.status(500).json({ error: "Erro interno." });
      }
    }
  }

  async getUserById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const user = await GetUserByIdService.execute({ id });

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ error: error.message });
      } else {
        return res.status(500).json({ error: "Erro interno." });
      }
    }
  }

  async listUsers(req: Request, res: Response) {
    const {
      fullName,
      email,
      isDeleted,
      sortBy,
      sortOrder,
      page,
      perPage,
      Role,
    } = req.query;

    try {
      const users = await ListUsersService.execute({
        fullName: fullName as string,
        email: email as string,
        isDeleted: isDeleted === "true",
        sortBy: sortBy as "fullName" | "createdAt" | "deletedAt",
        sortOrder: "asc",
        page: page ? Number(page) : undefined,
        perPage: perPage ? Number(perPage) : undefined,
        Role: Role as string,
      });

      if (users.users.length == 0) {
        throw new Error("Usuários não encontrados.");
      }

      return res.status(200).json(users);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ error: error.message });
      } else {
        return res.status(500).json({ error: "Erro interno." });
      }
    }
  }

  async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array().map((error) => error.msg) });
    }

    try {
      const updatedUser = await UpdateUserService.updateUser(id, data);

      if (!updatedUser) {
        throw new Error("Usuário não encontrado.");
      }

      return res.status(200).json({ updatedUser });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message == "Email") {
          return res
            .status(400)
            .json({ error: "Email já está sendo utilizado" });
        } else {
          return res.status(404).json({ error: error.message });
        }
      } else {
        return res.status(500).json({ error: "Erro interno." });
      }
    }
  }

  async deleteUser(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await deleteUserService.deleteUser(id);
      return res.status(204).json();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({ error: error.message });
      } else {
        return res.status(500).json({ error: "Erro interno" });
      }
    }
  }
}

export default new UserController();

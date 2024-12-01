// src/__tests__/users/user.controller.test.ts

import { Request, Response } from "express";
import * as expressValidator from "express-validator"; // Importa todo o módulo
import UserController from "../../modules/users/controllers/UserController"; // Atualize o caminho conforme necessário
import createUserService from "../../modules/users/services/createUserService";
import GetUserByIdService from "../../modules/users/services/getIdUserService";
import ListUsersService from "../../modules/users/services/listUsersService";
import UpdateUserService from "../../modules/users/services/updateUserService";
import deleteUserService from "../../modules/users/services/deleteUserService";

// Mock dos serviços
jest.mock("../../modules/users/services/createUserService");
jest.mock("../../modules/users/services/getIdUserService");
jest.mock("../../modules/users/services/listUsersService");
jest.mock("../../modules/users/services/updateUserService");
jest.mock("../../modules/users/services/deleteUserService");

describe("UserController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {};
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    res.status = statusMock;
    res.json = jsonMock;

    // Mock para validationResult que retorna sem erros
  });

  afterEach(() => {
    jest.resetAllMocks(); // Reseta todos os mocks após cada teste
  });

  describe("createUser", () => {
    it("deve criar um usuário com sucesso e retornar status 201", async () => {
      req.body = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123",
        Role: "user",
      };

      const mockUser = { id: "1", ...req.body };
      (createUserService.createUser as jest.Mock).mockResolvedValue(mockUser);

      await UserController.createUser(req as Request, res as Response);

      expect(createUserService.createUser).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockUser);
    });

    it("deve retornar erro 400 se o serviço lançar um erro conhecido", async () => {
      req.body = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123",
        Role: "user",
      };

      const errorMessage = "Email já está em uso";
      (createUserService.createUser as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await UserController.createUser(req as Request, res as Response);

      expect(createUserService.createUser).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });

    it("deve retornar erro 500 se o serviço lançar um erro desconhecido", async () => {
      req.body = {
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123",
        Role: "user",
      };

      (createUserService.createUser as jest.Mock).mockRejectedValue({});

      await UserController.createUser(req as Request, res as Response);

      expect(createUserService.createUser).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Erro interno." });
    });
  });

  describe("getUserById", () => {
    it("deve retornar um usuário e status 200", async () => {
      req.params = { id: "1" };
      const mockUser = { id: "1", fullName: "John Doe" };
      (GetUserByIdService.execute as jest.Mock).mockResolvedValue(mockUser);

      await UserController.getUserById(req as Request, res as Response);

      expect(GetUserByIdService.execute).toHaveBeenCalledWith({ id: "1" });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockUser);
    });

    it("deve retornar erro 404 se o usuário não for encontrado", async () => {
      req.params = { id: "1" };
      const errorMessage = "Usuário não encontrado";
      (GetUserByIdService.execute as jest.Mock).mockResolvedValue(null);

      await UserController.getUserById(req as Request, res as Response);

      expect(GetUserByIdService.execute).toHaveBeenCalledWith({ id: "1" });
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });

    it("deve retornar erro 500 se ocorrer um erro desconhecido", async () => {
      req.params = { id: "1" };
      (GetUserByIdService.execute as jest.Mock).mockRejectedValue({});

      await UserController.getUserById(req as Request, res as Response);

      expect(GetUserByIdService.execute).toHaveBeenCalledWith({ id: "1" });
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Erro interno." });
    });
  });

  describe("listUsers", () => {
    it("deve listar usuários e retornar status 200", async () => {
      req.query = {
        fullName: "John",
        email: "john@example.com",
        isDeleted: "false",
        sortBy: "fullName",
        sortOrder: "asc",
        page: "1",
        perPage: "10",
        Role: "user",
      };

      const mockUsers = {
        users: [{ id: "1", fullName: "John Doe" }],
        total: 1,
        page: 1,
        perPage: 10,
      };

      (ListUsersService.execute as jest.Mock).mockResolvedValue(mockUsers);

      await UserController.listUsers(req as Request, res as Response);

      expect(ListUsersService.execute).toHaveBeenCalledWith({
        fullName: "John",
        email: "john@example.com",
        isDeleted: false,
        sortBy: "fullName",
        sortOrder: "asc",
        page: 1,
        perPage: 10,
        Role: "user",
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockUsers);
    });

    it("deve retornar erro 404 se nenhum usuário for encontrado", async () => {
      req.query = {};
      (ListUsersService.execute as jest.Mock).mockResolvedValue({
        users: [],
        total: 0,
        page: 0,
        perPage: 0,
      });

      await UserController.listUsers(req as Request, res as Response);

      expect(ListUsersService.execute).toHaveBeenCalledWith({
        fullName: undefined,
        email: undefined,
        isDeleted: false,
        sortBy: undefined,
        sortOrder: "asc",
        page: undefined,
        perPage: undefined,
        Role: undefined,
      });
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Usuários não encontrados.",
      });
    });

    it("deve retornar erro 500 se ocorrer um erro desconhecido", async () => {
      req.query = {};
      (ListUsersService.execute as jest.Mock).mockRejectedValue({});

      await UserController.listUsers(req as Request, res as Response);

      expect(ListUsersService.execute).toHaveBeenCalledWith({
        fullName: undefined,
        email: undefined,
        isDeleted: false,
        sortBy: undefined,
        sortOrder: "asc",
        page: undefined,
        perPage: undefined,
        Role: undefined,
      });
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Erro interno." });
    });
  });

  describe("updateUser", () => {
    it("deve atualizar um usuário e retornar status 200", async () => {
      req.params = { id: "1" };
      req.body = { fullName: "Jane Doe" };

      const mockUpdatedUser = { id: "1", fullName: "Jane Doe" };
      (UpdateUserService.updateUser as jest.Mock).mockResolvedValue(
        mockUpdatedUser
      );

      await UserController.updateUser(req as Request, res as Response);

      expect(UpdateUserService.updateUser).toHaveBeenCalledWith("1", req.body);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ updatedUser: mockUpdatedUser });
    });

    it("deve retornar erro 400 se o email já estiver em uso", async () => {
      req.params = { id: "1" };
      req.body = { email: "existing@example.com" };

      (UpdateUserService.updateUser as jest.Mock).mockRejectedValue(
        new Error("Email")
      );

      await UserController.updateUser(req as Request, res as Response);

      expect(UpdateUserService.updateUser).toHaveBeenCalledWith("1", req.body);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Email já está sendo utilizado",
      });
    });

    it("deve retornar erro 404 se o usuário não for encontrado", async () => {
      req.params = { id: "1" };
      req.body = { fullName: "Jane Doe" };

      const errorMessage = "Usuário não encontrado.";
      (UpdateUserService.updateUser as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await UserController.updateUser(req as Request, res as Response);

      expect(UpdateUserService.updateUser).toHaveBeenCalledWith("1", req.body);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });

    it("deve retornar erro 500 se ocorrer um erro desconhecido", async () => {
      req.params = { id: "1" };
      req.body = { fullName: "Jane Doe" };

      (UpdateUserService.updateUser as jest.Mock).mockRejectedValue({});

      await UserController.updateUser(req as Request, res as Response);

      expect(UpdateUserService.updateUser).toHaveBeenCalledWith("1", req.body);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Erro interno." });
    });
  });

  describe("deleteUser", () => {
    it("deve deletar um usuário e retornar status 204", async () => {
      req.params = { id: "1" };
      (deleteUserService.deleteUser as jest.Mock).mockResolvedValue(undefined);

      await UserController.deleteUser(req as Request, res as Response);

      expect(deleteUserService.deleteUser).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(jsonMock).toHaveBeenCalledWith();
    });

    it("deve retornar erro 404 se o usuário não for encontrado", async () => {
      req.params = { id: "1" };
      const errorMessage = "Usuário não encontrado";
      (deleteUserService.deleteUser as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await UserController.deleteUser(req as Request, res as Response);

      expect(deleteUserService.deleteUser).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });

    it("deve retornar erro 500 se ocorrer um erro desconhecido", async () => {
      req.params = { id: "1" };
      (deleteUserService.deleteUser as jest.Mock).mockRejectedValue({});

      await UserController.deleteUser(req as Request, res as Response);

      expect(deleteUserService.deleteUser).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Erro interno" });
    });
  });
});

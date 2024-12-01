import { Request, Response } from "express";
import ClientController from "../../modules/clients/controllers/ClientController"; // ajuste o caminho conforme necessário
import CreateClient from "../../modules/clients/services/CreateClient";
import ListClientService from "../../modules/clients/services/ListClientService";
import ShowClientService from "../../modules/clients/services/ShowClientService";
import UpdateClientService from "../../modules/clients/services/UpdateClientService";
import DeleteClientService from "../../modules/clients/services/DeleteClientservice";

jest.mock("../../modules/clients/services/CreateClient");
jest.mock("../../modules/clients/services/ListClientService");
jest.mock("../../modules/clients/services/ShowClientService");
jest.mock("../../modules/clients/services/UpdateClientService");
jest.mock("../../modules/clients/services/DeleteClientService");

describe("ClientController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    req = {};
    jsonMock = jest.fn();
    sendMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock, send: sendMock });
    res = {
      status: statusMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("deve criar um cliente com sucesso", async () => {
      req.body = {
        fullName: "João Silva Atualizado",
        birthDate: "1990-01-01",
        cpf: "12345678901",
        email: "joao.atualizado@example.com",
        phone: "0987654321",
      };

      const mockClient = { id: "1", ...req.body };
      (CreateClient.createClient as jest.Mock).mockResolvedValue(mockClient);

      const controller = ClientController;

      await controller.create(req as Request, res as Response);

      expect(CreateClient.createClient).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(mockClient);
    });

    it("deve retornar 400 se o corpo da requisição estiver ausente", async () => {
      req.body = undefined;

      const controller = ClientController;

      await controller.create(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Corpo da requisição não está definido.",
      });
    });

    it("deve lidar com erro de formato de e-mail inválido", async () => {
      req.body = {
        fullName: "João Silva Atualizado",
        birthDate: "1990-01-01",
        cpf: "12345678901",
        email: "joao.atualizado@example.com",
        phone: "0987654321",
      };

      const error = new Error("Invalid email format");
      (CreateClient.createClient as jest.Mock).mockRejectedValue(error);

      const controller = ClientController;

      await controller.create(req as Request, res as Response);

      expect(CreateClient.createClient).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Invalid email format",
      });
    });

    it("deve lidar com erro de cliente já existente", async () => {
      req.body = {
        fullName: "João Silva Atualizado",
        birthDate: "1990-01-01",
        cpf: "12345678901",
        email: "joao.atualizado@example.com",
        phone: "0987654321",
      };

      const error = new Error("Client already exists");
      (CreateClient.createClient as jest.Mock).mockRejectedValue(error);

      const controller = ClientController;

      await controller.create(req as Request, res as Response);

      expect(CreateClient.createClient).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Client already exist",
      });
    });

    it("deve lidar com erros inesperados", async () => {
      req.body = {
        fullName: "João Silva Atualizado",
        birthDate: "1990-01-01",
        cpf: "12345678901",
        email: "joao.atualizado@example.com",
        phone: "0987654321",
      };

      const error = new Error("Erro inesperado");
      (CreateClient.createClient as jest.Mock).mockRejectedValue(error);

      const controller = ClientController;

      await controller.create(req as Request, res as Response);

      expect(CreateClient.createClient).toHaveBeenCalledWith(req.body);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "An unexpected error occurred: Erro inesperado",
      });
    });
  });

  describe("list", () => {
    it("deve listar clientes com paginação padrão", async () => {
      req.query = {};

      const mockClients = [
        {
          id: "1",
          fullName: "João Silva Atualizado",
          birthDate: "1990-01-01",
          cpf: "12345678901",
          email: "joao.atualizado@example.com",
          phone: "0987654321",
        },
        {
          id: "2",
          fullName: "João Silva Atualizado",
          birthDate: "1990-01-01",
          cpf: "12345678901",
          email: "joao.atualizado@example.com",
          phone: "0987654321",
        },
      ];

      (ListClientService.listClient as jest.Mock).mockResolvedValue(
        mockClients
      );

      const controller = ClientController;

      await controller.list(req as Request, res as Response);

      expect(ListClientService.listClient).toHaveBeenCalledWith({
        nome: undefined,
        email: undefined,
        cpf: undefined,
        excluido: undefined,
        page: 1,
        limit: 15,
        orderBy: [],
      });

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockClients);
    });

    it("deve listar clientes com parâmetros de consulta especificados", async () => {
      req.query = {
        page: "2",
        limit: "10",
        fullName: "João Silva Atualizado",
        birthDate: "1990-01-01",
        cpf: "12345678901",
        email: "joao.atualizado@example.com",
        phone: "0987654321",
        orderBy: ["fullName", "email"],
      };

      const mockClients = [
        {
          id: "1",
          fullName: "João Silva Atualizado",
          birthDate: "1990-01-01",
          cpf: "12345678901",
          email: "joao.atualizado@example.com",
          phone: "0987654321",
        },
      ];

      (ListClientService.listClient as jest.Mock).mockResolvedValue(
        mockClients
      );

      const controller = ClientController;

      await controller.list(req as Request, res as Response);

      expect(ListClientService.listClient).toHaveBeenCalledWith({
        cpf: "12345678901",
        email: "joao.atualizado@example.com",
        excluido: undefined,
        nome: undefined,
        limit: 10,
        orderBy: ["fullName", "email"],
        page: 2,
      });

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockClients);
    });
  });

  describe("show", () => {
    it("deve retornar os dados do cliente quando o cliente existir", async () => {
      req.params = { id: "1" };

      const mockClient = {
        id: "1",
        fullName: "João Silva Atualizado",
        birthDate: "1990-01-01",
        cpf: "12345678901",
        email: "joao.atualizado@example.com",
        phone: "0987654321",
      };

      (ShowClientService.showClient as jest.Mock).mockResolvedValue(mockClient);

      const controller = ClientController;

      await controller.show(req as Request, res as Response);

      expect(ShowClientService.showClient).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockClient);
    });

    it("deve retornar 404 quando o cliente não existir", async () => {
      req.params = { id: "1" };

      (ShowClientService.showClient as jest.Mock).mockResolvedValue(null);

      const controller = ClientController;

      await controller.show(req as Request, res as Response);

      expect(ShowClientService.showClient).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Client Not Found" });
    });
  });

  describe("update", () => {
    it("deve atualizar um cliente com sucesso", async () => {
      req.params = { id: "1" };
      req.body = {
        fullName: "João Silva Atualizado",
        birthDate: "1990-01-01",
        cpf: "12345678901",
        email: "joao.atualizado@example.com",
        phone: "0987654321",
      };

      const mockClient = { id: "1", ...req.body };

      (UpdateClientService.updateClient as jest.Mock).mockResolvedValue(
        mockClient
      );

      const controller = ClientController;

      await controller.update(req as Request, res as Response);

      expect(UpdateClientService.updateClient).toHaveBeenCalledWith({
        id: "1",
        ...req.body,
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockClient);
    });

    it("deve lidar com erro de cliente não encontrado", async () => {
      req.params = { id: "1" };
      req.body = {
        fullName: "João Silva Atualizado",
        birthDate: "1990-01-01",
        cpf: "12345678901",
        email: "joao.atualizado@example.com",
        phone: "0987654321",
      };

      const error = new Error("Client not found");
      (UpdateClientService.updateClient as jest.Mock).mockRejectedValue(error);

      const controller = ClientController;

      await controller.update(req as Request, res as Response);

      expect(UpdateClientService.updateClient).toHaveBeenCalledWith({
        id: "1",
        ...req.body,
      });
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Client not found" });
    });

    it("deve lidar com erros inesperados", async () => {
      req.params = { id: "1" };
      req.body = {
        fullName: "João Silva Atualizado",
        email: "joao.atualizado@example.com",
        cpf: "12345678901",
        phone: "0987654321",
        birthDate: "1990-01-01",
      };

      const error = new Error("Erro inesperado");
      (UpdateClientService.updateClient as jest.Mock).mockRejectedValue(error);

      const controller = ClientController;

      await controller.update(req as Request, res as Response);

      expect(UpdateClientService.updateClient).toHaveBeenCalledWith({
        id: "1",
        ...req.body,
      });
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "An unexpected error occurred: Erro inesperado",
      });
    });
  });

  describe("delete", () => {
    it("deve deletar um cliente com sucesso", async () => {
      req.params = { id: "1" };

      (DeleteClientService.deleteClient as jest.Mock).mockResolvedValue(
        undefined
      );

      const controller = ClientController;

      await controller.delete(req as Request, res as Response);

      expect(DeleteClientService.deleteClient).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledTimes(1);
      expect(jsonMock).toHaveBeenCalledWith();
    });

    it("deve retornar 404 quando o cliente não for encontrado", async () => {
      req.params = { id: "1" };

      const error = new Error("Client Not Found");
      (DeleteClientService.deleteClient as jest.Mock).mockRejectedValue(error);

      const controller = ClientController;

      await controller.delete(req as Request, res as Response);

      expect(DeleteClientService.deleteClient).toHaveBeenCalledWith("1");
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Client Not Found" });
    });
  });
});

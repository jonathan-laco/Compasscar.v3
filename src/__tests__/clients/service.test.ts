import { PrismaClient } from "@prisma/client";
import CreateClientService from "../../modules/clients/services/CreateClient";
import ListClientService from "../../modules/clients/services/ListClientService";

// Mock do Prisma Client
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    client: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

// Testes para o CreateClientService
describe("CreateClientService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um cliente com sucesso", async () => {
    const mockClient = {
      id: "1",
      fullName: "João Silva",
      birthDate: new Date("1990-01-01"),
      cpf: "12345678901",
      email: "joao.silva@example.com",
      phone: "0987654321",
    };

    // Configurações do mock
    (prisma.client.findUnique as jest.Mock).mockResolvedValue(null); // Cliente não existe
    (prisma.client.create as jest.Mock).mockResolvedValue(mockClient); // Retorna cliente criado

    const result = await CreateClientService.createClient({
      fullName: "João Silva",
      birthDate: new Date("1990-01-01"),
      cpf: "12345678901",
      email: "joao.silva@example.com",
      phone: "0987654321",
    });

    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { cpf: "12345678901", email: "joao.silva@example.com" },
    });
    expect(prisma.client.create).toHaveBeenCalledWith({
      data: {
        fullName: "João Silva",
        birthDate: new Date("1990-01-01"),
        cpf: "12345678901",
        email: "joao.silva@example.com",
        phone: "0987654321",
      },
    });
    expect(result).toEqual(mockClient);
  });

  it("deve lançar erro se o cliente já existir", async () => {
    const mockClient = {
      id: "1",
      fullName: "João Silva",
      birthDate: new Date("1990-01-01"),
      cpf: "12345678901",
      email: "joao.silva@example.com",
      phone: "0987654321",
    };

    (prisma.client.findUnique as jest.Mock).mockResolvedValue(mockClient); // Cliente já existe

    await expect(
      CreateClientService.createClient({
        fullName: "João Silva",
        birthDate: new Date("1990-01-01"),
        cpf: "12345678901",
        email: "joao.silva@example.com",
        phone: "0987654321",
      })
    ).rejects.toThrow("Client already exists");
  });

  it("deve lançar erro para CPF inválido", async () => {
    await expect(
      CreateClientService.createClient({
        fullName: "João Silva",
        birthDate: new Date("1990-01-01"),
        cpf: "1234567890A", // CPF inválido
        email: "joao.silva@example.com",
        phone: "0987654321",
      })
    ).rejects.toThrow("Invalid cpf format");
  });

  it("deve lançar erro para email inválido", async () => {
    await expect(
      CreateClientService.createClient({
        fullName: "João Silva",
        birthDate: new Date("1990-01-01"),
        cpf: "12345678901",
        email: "joao.silva@", // Email inválido
        phone: "0987654321",
      })
    ).rejects.toThrow("Invalid email format");
  });
});

// Testes para o ListClientService
describe("ListClientService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve listar clientes com sucesso usando parâmetros padrão", async () => {
    const mockClients = [
      {
        id: "1",
        fullName: "João Silva",
        birthDate: new Date("1990-01-01"),
        cpf: "12345678901",
        email: "joao.silva@example.com",
        phone: "0987654321",
        deletedAt: null,
      },
      {
        id: "2",
        fullName: "Maria Souza",
        birthDate: new Date("1985-05-20"),
        cpf: "09876543210",
        email: "maria.souza@example.com",
        phone: "1122334455",
        deletedAt: null,
      },
    ];

    (prisma.client.findMany as jest.Mock).mockResolvedValue(mockClients);

    const result = await ListClientService.listClient({
      nome: undefined,
      email: undefined,
      cpf: undefined,
      excluido: undefined,
      page: 1,
      limit: 10,
      orderBy: ["fullName"],
    });

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null, // Nenhum cliente excluído
      },
      skip: 0,
      take: 10,
    });

    expect(result).toEqual(mockClients);
  });

  it("deve listar clientes filtrados por nome e ordenados por e-mail", async () => {
    const mockClients = [
      {
        id: "2",
        fullName: "Ana Clara",
        birthDate: new Date("1995-08-15"),
        cpf: "56789012345",
        email: "ana.clara@example.com",
        phone: "4455667788",
        deletedAt: null,
      },
      {
        id: "1",
        fullName: "Carlos Andrade",
        birthDate: new Date("1990-01-01"),
        cpf: "12345678901",
        email: "carlos.andrade@example.com",
        phone: "9988776655",
        deletedAt: null,
      },
    ];

    (prisma.client.findMany as jest.Mock).mockResolvedValue(mockClients);

    const result = await ListClientService.listClient({
      nome: "Ana",
      email: undefined,
      cpf: undefined,
      excluido: undefined,
      page: 1,
      limit: 10,
      orderBy: ["email"],
    });

    expect(prisma.client.findMany).toHaveBeenCalledWith({
      where: {
        fullName: { contains: "Ana" },
        deletedAt: null,
      },
      skip: 0,
      take: 10,
    });

    expect(result).toEqual(mockClients);
  });
});

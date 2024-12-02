import { PrismaClient, Status } from "@prisma/client";
import orderService from "../../modules/orders/services/order.service"; // Ajuste o caminho conforme necessário
import axios from "axios";

// Mock do Prisma Client
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    order: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock do Axios
jest.mock("axios");

const prisma = new PrismaClient();

describe("OrderService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("deve criar um pedido com sucesso", async () => {
      const mockOrder = {
        id: "1",
        clientId: "client1",
        carId: "car1",
        status: "OPEN" as Status,
        totalValue: 0,
        createdAt: new Date(),
        zipcode: "",
        city: "",
        state: "",
      };

      // Mock para simular que o pedido não existe
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null); // Não existe pedido aberto para o cliente

      // Mock para simular a criação do pedido
      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const data = {
        carId: "car1",
        clientId: "client1",
      };

      const result = await orderService.createOrder(data);

      // Verificar se a função `findFirst` foi chamada com os parâmetros corretos
      expect(prisma.order.findFirst).toHaveBeenCalledWith({
        where: {
          clientId: "client1",
          status: "OPEN", // status de "OPEN"
        },
      });

      // Verificar se a função `create` foi chamada com os dados corretos
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          ...data,
          status: "OPEN", // status de "OPEN"
          totalValue: 0,
          createdAt: expect.any(Date),
          zipcode: "",
          city: "",
          state: "",
        },
      });

      // Verificar se o resultado retornado é o pedido mockado
      expect(result).toEqual(mockOrder);
    });

    it("não deve criar um pedido se já existir um pedido aberto para o cliente", async () => {
      const existingOrder = {
        id: "1",
        clientId: "client1",
        carId: "car1",
        status: "OPEN" as Status,
        totalValue: 0,
        createdAt: new Date(),
        zipcode: "",
        city: "",
        state: "",
      };

      // Mock para simular que já existe um pedido aberto para o cliente
      (prisma.order.findFirst as jest.Mock).mockResolvedValue(existingOrder); // Pedido já existe

      const data = {
        carId: "car1",
        clientId: "client1",
      };

      // Verificar se um erro é lançado quando já existir um pedido aberto
      await expect(orderService.createOrder(data)).rejects.toThrow(
        "Este cliente já possui um pedido aberto."
      );

      // Verificar se a função `findFirst` foi chamada
      expect(prisma.order.findFirst).toHaveBeenCalledWith({
        where: {
          clientId: "client1",
          status: "OPEN", // status de "OPEN"
        },
      });

      // A função `create` não deve ser chamada se já existir um pedido aberto
      expect(prisma.order.create).not.toHaveBeenCalled();
    });
  });

  describe("updateOrder", () => {
    it("deve atualizar um pedido com sucesso", async () => {
      const mockOrder = {
        id: "1",
        clientId: "client1",
        carId: "car1",
        status: "OPEN" as Status,
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        zipcode: "12345678",
        city: "Cidade Teste",
        state: "SP",
      };

      // Mock para simular que o pedido existe
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      // Mock para simular a atualização do pedido
      (prisma.order.update as jest.Mock).mockResolvedValue(mockOrder);

      // Mock para simular a resposta da API do ViaCEP
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          localidade: "Cidade Teste",
          uf: "SP",
        },
      });

      const data = {
        id: "1",
        status: "APPROVED",
        zipcode: "12345678",
        city: "Cidade Teste",
        state: "SP",
        startDate: "2024-01-01",
        endDate: "2024-01-10",
      };

      const result = await orderService.updateOrder(data.id, data);

      // Verificar se a função `findUnique` foi chamada para encontrar o pedido
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });

      // Verificar se a função `update` foi chamada com os dados corretos
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: expect.objectContaining({
          status: "APPROVED",
          startDate: { set: expect.any(Date) },
          endDate: { set: expect.any(Date) },
        }),
      });

      // Verificar se o resultado retornado é o pedido atualizado
      expect(result).toEqual(mockOrder);
    });

    it("não deve atualizar um pedido se não encontrado", async () => {
      // Mock para simular que o pedido não existe
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      const data = {
        id: "1",
        status: "APPROVED",
      };

      // Verificar se um erro é lançado quando o pedido não for encontrado
      await expect(orderService.updateOrder(data.id, data)).rejects.toThrow(
        "Pedido não encontrado."
      );
    });

    it("deve lançar erro quando o CEP não for encontrado", async () => {
      // Mock para simular que o pedido existe
      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: "1",
        clientId: "client1",
        carId: "car1",
        status: "OPEN" as Status,
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        zipcode: "00000000", // CEP que vai falhar na consulta
        city: "Cidade Teste",
        state: "SP",
      });

      // Mock para simular a falha na consulta do CEP
      (axios.get as jest.Mock).mockResolvedValue({
        data: { erro: true },
      });

      const data = {
        id: "1",
        status: "APPROVED",
        zipcode: "00000000", // CEP inválido
        city: "Cidade Teste",
        state: "SP",
        startDate: "2024-01-01",
        endDate: "2024-01-10",
      };

      // Esperar que o erro seja lançado
      await expect(orderService.updateOrder(data.id, data)).rejects.toThrow(
        "CEP não encontrado."
      );

      // Verificar se a função `axios.get` foi chamada
      expect(axios.get).toHaveBeenCalledWith(
        "https://viacep.com.br/ws/00000000/json/"
      );
    });
  });

  // Outros testes podem ser adicionados aqui, como o teste de `deleteOrder`, `getOrderById`, etc.
});

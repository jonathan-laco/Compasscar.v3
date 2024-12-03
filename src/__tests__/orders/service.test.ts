import { PrismaClient, Status } from "@prisma/client";
import orderService from "../../modules/orders/services/order.service"; // Ajuste o caminho conforme necessário
import axios from "axios";

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

jest.mock("axios");

const prisma = new PrismaClient();
const estadosPermitidos = [
  "AL",
  "BA",
  "CE",
  "MA",
  "PB",
  "PE",
  "PI",
  "RN",
  "SE",
];

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
        updatedAt: new Date(),
        zipcode: "",
        city: "",
        state: "",
      };

      (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

      (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);

      const data = { clientId: "client1", carId: "car1" };

      const result = await orderService.createOrder(data);

      expect(prisma.order.findFirst).toHaveBeenCalledWith({
        where: { clientId: "client1", status: "OPEN" },
      });
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          clientId: "client1",
          carId: "car1",
          status: "OPEN",
          totalValue: 0,
          createdAt: expect.any(Date),
          zipcode: "",
          city: "",
          state: "",
        },
      });
      expect(result).toEqual(mockOrder);
    });

    it("deve lançar erro se o cliente já tiver um pedido aberto", async () => {
      const mockExistingOrder = { id: "1", status: "OPEN" as Status };

      (prisma.order.findFirst as jest.Mock).mockResolvedValue(
        mockExistingOrder
      );

      const data = { clientId: "client1", carId: "car1" };

      await expect(orderService.createOrder(data)).rejects.toThrow(
        "Este cliente já possui um pedido aberto."
      );
    });
  });

  describe("getOrderById", () => {
    it("deve retornar o pedido corretamente", async () => {
      const mockOrder = {
        id: "1",
        clientId: "client1",
        carId: "car1",
        status: "OPEN" as Status,
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        zipcode: "12345678",
        city: "Salvador",
        state: "BA",
      };

      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById("1");

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockOrder);
    });

    it("deve lançar erro se o pedido não for encontrado", async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(orderService.getOrderById("1")).rejects.toThrow(
        "Pedido não encontrado"
      );
    });
  });

  describe("listOrders", () => {
    it("deve listar os pedidos com sucesso", async () => {
      const mockOrders = [
        {
          id: "1",
          clientId: "client1",
          carId: "car1",
          status: "OPEN" as Status,
          totalValue: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          zipcode: "12345678",
          city: "Salvador",
          state: "BA",
        },
      ];

      (prisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (prisma.order.count as jest.Mock).mockResolvedValue(1);

      const params = {
        status: "OPEN",
        clientCpf: "12345678900",
        startDate: "2024-01-01",
        endDate: "2024-01-10",
        sort: "createdAt",
        order: "asc" as "asc",
        page: 1,
        limit: 10,
      };

      const result = await orderService.listOrders(params);

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        include: expect.any(Object),
        orderBy: { createdAt: "asc" },
        skip: 0,
        take: 10,
      });

      expect(result.orders).toEqual(mockOrders);
      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        pages: 1,
      });
    });
  });

  describe("updateOrder", () => {
    it("deve atualizar um pedido com sucesso para um estado permitido", async () => {
      const mockOrder = {
        id: "1",
        clientId: "client1",
        carId: "car1",
        status: "OPEN" as Status,
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        zipcode: "12345678",
        city: "Salvador",
        state: "BA",
      };

      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "APPROVED",
      });

      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          localidade: "Salvador",
          uf: "BA", // Estado valido
        },
      });

      const data = {
        id: "1",
        status: "APPROVED",
        zipcode: "12345678",
        city: "Salvador",
        state: "BA",
        startDate: "2024-01-01",
        endDate: "2024-01-10",
      };

      const result = await orderService.updateOrder(data.id, data);

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: expect.objectContaining({
          status: "APPROVED",
          startDate: { set: expect.any(Date) },
          endDate: { set: expect.any(Date) },
        }),
      });

      expect(result).toEqual(expect.objectContaining({ status: "APPROVED" }));
    });

    it("deve lançar erro quando o pedido não for encontrado", async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      const data = {
        id: "1",
        status: "APPROVED",
        zipcode: "12345678",
        city: "Salvador",
        state: "BA",
        startDate: "2024-01-01",
        endDate: "2024-01-10",
      };

      await expect(orderService.updateOrder(data.id, data)).rejects.toThrow(
        "Pedido não encontrado."
      );
    });

    it("deve lançar erro quando o status do pedido não for 'OPEN'", async () => {
      const mockOrder = {
        id: "1",
        clientId: "client1",
        carId: "car1",
        status: "APPROVED" as Status,
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        zipcode: "12345678",
        city: "Salvador",
        state: "BA",
      };

      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      const data = {
        id: "1",
        status: "APPROVED",
        zipcode: "12345678",
        city: "Salvador",
        state: "BA",
        startDate: "2024-01-01",
        endDate: "2024-01-10",
      };

      await expect(orderService.updateOrder(data.id, data)).rejects.toThrow(
        "O status do pedido só pode ser alterado se o pedido estiver aberto."
      );
    });
  });

  // AQUI
  describe("deleteOrder", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("deve deletar um pedido com sucesso", async () => {
      const mockOrder = {
        id: "1",
        clientId: "client1",
        carId: "car1",
        status: "OPEN",
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        zipcode: "12345678",
        city: "Salvador",
        state: "BA",
      };

      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      (prisma.order.update as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: "CANCELED",
        cancellationDate: new Date(),
      });

      const result = await orderService.deleteOrder("1");

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          status: "CANCELED",
          cancellationDate: expect.any(Date),
        },
      });

      expect(result).toEqual(expect.objectContaining({ status: "CANCELED" }));
    });

    it("deve lançar erro se o pedido não for encontrado", async () => {
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(orderService.deleteOrder("1")).rejects.toThrow(
        "Pedido não encontrado."
      );
    });

    it("deve lançar erro se o pedido não estiver no status 'OPEN'", async () => {
      const mockOrder = {
        id: "1",
        clientId: "client1",
        carId: "car1",
        status: "APPROVED",
        totalValue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        zipcode: "12345678",
        city: "Salvador",
        state: "BA",
      };

      // Mock para simular que o pedido existe
      (prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      await expect(orderService.deleteOrder("1")).rejects.toThrow(
        "Apenas pedidos com status 'Aberto' podem ser cancelados."
      );
    });
  });
});

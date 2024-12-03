import { PrismaClient, Status } from "@prisma/client";
import {
  createCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
} from "../../modules/cars/services/car.service";

// Mock do Prisma Client
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    car: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(), // Mock para update
    },
    order: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

const prisma = new PrismaClient();

describe("createCar, getAllCars, getCarById, updateCar, deleteCar", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste para createCar
  it("deve criar um carro com sucesso", async () => {
    const mockCar = {
      id: "1",
      plate: "ABC1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      price: 30000,
      km: 50000,
      status: "ACTIVED" as Status,
      Items: [],
    };

    (prisma.car.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.car.create as jest.Mock).mockResolvedValue(mockCar);

    const data = {
      plate: "ABC1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      price: 30000,
      km: 50000,
      status: "ACTIVED",
      Items: [],
    };

    const result = await createCar(data);

    expect(prisma.car.findFirst).toHaveBeenCalledWith({
      where: {
        plate: "ABC1234",
        status: { in: ["ACTIVED", "INACTIVED"] },
      },
    });

    expect(prisma.car.create).toHaveBeenCalledWith({
      data: {
        ...data,
        Items: undefined,
      },
      include: { Items: true },
    });

    expect(result).toEqual(mockCar);
  });

  it("deve lançar erro se houver um problema na criação do carro", async () => {
    const errorMessage = "Erro ao criar o carro.";
    (prisma.car.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.car.create as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const data = {
      plate: "ABC1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      price: 30000,
      km: 50000,
      status: "ACTIVED",
      Items: [],
    };

    await expect(createCar(data)).rejects.toThrowError(errorMessage);

    expect(prisma.car.findFirst).toHaveBeenCalledWith({
      where: {
        plate: "ABC1234",
        status: { in: ["ACTIVED", "INACTIVED"] },
      },
    });

    expect(prisma.car.create).toHaveBeenCalledWith({
      data: {
        ...data,
        Items: undefined,
      },
      include: { Items: true },
    });
  });

  it("deve retornar todos os carros com os filtros aplicados", async () => {
    const mockCars = [
      {
        id: "1",
        plate: "ABC1234",
        brand: "Toyota",
        model: "Corolla",
        year: 2020,
        price: 30000,
        km: 50000,
        status: "ACTIVED" as Status,
        Items: [],
      },
      {
        id: "2",
        plate: "XYZ5678",
        brand: "Honda",
        model: "Civic",
        year: 2022,
        price: 35000,
        km: 10000,
        status: "ACTIVED" as Status,
        Items: [],
      },
    ];

    const mockTotalCars = 2;
    const mockTotalPages = 1;

    (prisma.car.findMany as jest.Mock).mockResolvedValue(mockCars);
    (prisma.car.count as jest.Mock).mockResolvedValue(mockTotalCars);

    const filters = { status: "ACTIVED" };
    const orderBy = { field: "price", direction: "asc" };
    const page = 1;
    const pageSize = 10;

    const result = await getAllCars(filters, orderBy, page, pageSize);

    expect(prisma.car.findMany).toHaveBeenCalledWith({
      where: { status: "ACTIVED" },
      include: { Items: true },
      orderBy: { price: "asc" },
      skip: 0,
      take: 10,
    });

    expect(prisma.car.count).toHaveBeenCalledWith({
      where: { status: "ACTIVED" },
    });

    expect(result).toEqual({
      cars: mockCars,
      totalCars: mockTotalCars,
      totalPages: mockTotalPages,
    });
  });

  it("deve retornar um carro pelo ID", async () => {
    const mockCar = {
      id: "1",
      plate: "ABC1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      price: 30000,
      km: 50000,
      status: "ACTIVED" as Status,
      Items: [],
    };

    (prisma.car.findUnique as jest.Mock).mockResolvedValue(mockCar);

    const carId = "1";
    const result = await getCarById(carId);

    expect(prisma.car.findUnique).toHaveBeenCalledWith({
      where: { id: carId },
      include: { Items: true },
    });

    expect(result).toEqual(mockCar);
  });

  it("deve atualizar as informações do carro", async () => {
    const mockCar = {
      id: "1",
      plate: "ABC1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      price: 30000,
      km: 50000,
      status: "ACTIVED" as Status,
      Items: [],
    };

    const mockUpdatedCar = {
      ...mockCar,
      price: 35000,
    };

    (prisma.car.update as jest.Mock).mockResolvedValue(mockUpdatedCar);

    const carId = "1";
    const data = {
      price: 35000,
      Items: [],
    };

    const result = await updateCar(carId, data);

    expect(prisma.car.update).toHaveBeenCalledWith({
      where: { id: carId },
      data: {
        ...data,
        Items: {
          deleteMany: {},
          create: [],
        },
      },
      include: { Items: true },
    });

    expect(result).toEqual(mockUpdatedCar);
  });

  it("deve excluir o carro com sucesso se não houver pedidos em aberto", async () => {
    const mockCar = {
      id: "1",
      plate: "ABC1234",
      brand: "Toyota",
      model: "Corolla",
      year: 2020,
      price: 30000,
      km: 50000,
      status: "ACTIVED" as Status,
      Items: [],
    };

    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

    (prisma.car.update as jest.Mock).mockResolvedValue({
      ...mockCar,
      status: "DELETED",
    });

    const carId = "1";

    const result = await deleteCar(carId);

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: {
        carId: carId,
        status: "OPEN",
      },
    });

    expect(prisma.car.update).toHaveBeenCalledWith({
      where: { id: carId },
      data: { status: "DELETED" },
    });

    expect(result).toEqual({
      message: "Carro marcado como 'DELETED' com sucesso",
    });
  });

  it("deve lançar erro se houver pedidos em aberto para o carro", async () => {
    (prisma.order.findFirst as jest.Mock).mockResolvedValue({
      id: "order-1",
      status: "OPEN",
      carId: "1",
    });

    const carId = "1";

    await expect(deleteCar(carId)).rejects.toThrow(
      "Não é possível excluir o carro. Há pedidos em aberto."
    );

    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: {
        carId: carId,
        status: "OPEN",
      },
    });

    expect(prisma.car.update).not.toHaveBeenCalled();
  });
});

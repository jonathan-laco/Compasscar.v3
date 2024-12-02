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

    (prisma.car.findFirst as jest.Mock).mockResolvedValue(null); // Carro não existe
    (prisma.car.create as jest.Mock).mockResolvedValue(mockCar); // Retorna o carro criado

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

  // Teste para createCar com erro
  it("deve lançar erro se houver um problema na criação do carro", async () => {
    // Simulando que a função create lança um erro
    const errorMessage = "Erro ao criar o carro.";
    (prisma.car.findFirst as jest.Mock).mockResolvedValue(null); // Carro não existe
    (prisma.car.create as jest.Mock).mockRejectedValue(new Error(errorMessage)); // Lança erro ao tentar criar

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

    // Verificar se o erro é tratado corretamente
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

  // Teste para getAllCars
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

    (prisma.car.findMany as jest.Mock).mockResolvedValue(mockCars); // Retorna os carros
    (prisma.car.count as jest.Mock).mockResolvedValue(mockTotalCars); // Contagem total

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

  // Teste para getCarById
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

  // Teste para updateCar
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
      price: 35000, // Alterando o preço
    };

    // Mock para simular a atualização do carro
    (prisma.car.update as jest.Mock).mockResolvedValue(mockUpdatedCar);

    const carId = "1";
    const data = {
      price: 35000, // Novo preço
      Items: [], // Mantendo os itens como estão
    };

    const result = await updateCar(carId, data);

    // Verificar se o `update` foi chamado com o ID correto e os dados de atualização
    expect(prisma.car.update).toHaveBeenCalledWith({
      where: { id: carId },
      data: {
        ...data,
        Items: {
          deleteMany: {}, // Removendo itens antigos
          create: [], // Adicionando itens (nenhum no caso)
        },
      },
      include: { Items: true },
    });

    // Verificar se o resultado retornado é o carro atualizado
    expect(result).toEqual(mockUpdatedCar);
  });

  // Teste para deleteCar
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

    // Mock do findFirst para simular que não há pedidos em aberto
    (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

    // Mock da atualização do carro
    (prisma.car.update as jest.Mock).mockResolvedValue({
      ...mockCar,
      status: "DELETED",
    });

    const carId = "1";

    // Chama a função deleteCar
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
    // Mock do findFirst para simular que há um pedido em aberto
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

    // O método update não deve ser chamado pois houve um erro
    expect(prisma.car.update).not.toHaveBeenCalled();
  });
});

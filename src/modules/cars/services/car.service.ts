import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

export const createCar = async (data: any) => {
  const existingCar = await prisma.car.findFirst({
    where: {
      plate: data.plate,
      status: { in: ['ACTIVED', 'INACTIVED'] },
    },
  });

  if (existingCar) {
    throw new Error('Já existe um carro com esta placa com status ativo ou inativo.');
  }

  return prisma.car.create({
    data: {
      ...data,
      Items: data.Items && data.Items.length > 0 
        ? { create: data.Items.map((Item: string) => ({ name: Item })) }
        : undefined,
    },
    include: { Items: true },
  });
};

export const getAllCars = async (filters: any, orderBy: any, page: number, pageSize: number) => {
  const where: any = {};

  // Filtros
  if (filters.status) where.status = filters.status;
  if (filters.plate) where.plate = { endsWith: filters.plate };
  if (filters.brand) where.brand = filters.brand;
  if (filters.model) where.model = filters.model;
  if (filters.km) where.km = { lte: Number(filters.km) };
  if (filters.Items) where.Items = { some: { name: { in: filters.Items } } };

  // Filtro de Ano
  if (filters.minYear || filters.maxYear) {
    where.year = {};
    if (filters.minYear) where.year.gte = Number(filters.minYear);
    if (filters.maxYear) where.year.lte = Number(filters.maxYear);
  }

  // Filtro de Faixa de Preço
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = Number(filters.minPrice);
    if (filters.maxPrice) where.price.lte = Number(filters.maxPrice);
  }

  // Paginação
  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Ordenação
  const order = orderBy?.field ? { [orderBy.field]: orderBy.direction } : undefined;

  // Busca com filtros, ordenação e paginação
  const cars = await prisma.car.findMany({
    where,
    include: { Items: true },
    orderBy: order,
    skip,
    take,
  });

  // Contagem total de carros para paginação
  const totalCars = await prisma.car.count({ where });
  const totalPages = Math.ceil(totalCars / pageSize);

  return { cars, totalCars, totalPages };
};

export const getCarById = async (id: string) => {
  return prisma.car.findUnique({
    where: { id },
    include: { Items: true },
  });
};

export const hasOpenOrders = async (carId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      carId,
      status: 'OPEN', // Considerando que "OPEN" indica um pedido em aberto
    },
  });
  return orders.length > 0;
};

export const updateCar = async (id: string, data: any) => {
  return prisma.car.update({
    where: { id },
    data: {
      ...data,
      Items: {
        deleteMany: {}, // Remove todos os itens atuais
        create: data.Items.map((item: string) => ({ name: item })), // Adiciona os novos itens
      },
    },
    include: { Items: true },
  });
};

export const deleteCar = async (id: string) => {
  // Verifica se o carro está associado a algum pedido em aberto
  const hasOpenOrders = await prisma.order.findFirst({
    where: {
      carId: id,
      status: 'OPEN' // Considerando que o status 'OPEN' representa pedidos em aberto
    }
  });

  if (hasOpenOrders) {
    throw new Error("Não é possível excluir o carro. Há pedidos em aberto.");
  }

  // Atualiza o status do carro para 'DELETED' sem interferir nos itens associados
  await prisma.car.update({
    where: { id },
    data: { status: 'DELETED' }
  });

  return { message: "Carro marcado como 'DELETED' com sucesso" };
};


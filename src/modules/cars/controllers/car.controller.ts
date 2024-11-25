import { Request, Response, NextFunction } from 'express';
import { Status } from '@prisma/client';
import * as carService from '../services/car.service';

export const createCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
        const data = req.body;
        const newCar = await carService.createCar(data);
        return res.status(201).json(newCar);
    } catch (error) {
        console.error("Erro ao criar carro:", error);
        return res.status(500).json({
            message: "Erro ao criar carro",
            details: error instanceof Error ? error.message : "Erro desconhecido",
        });
    }
};

export const getCars = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extrai filtros da query
    const filters = {
      status: req.query.status as Status,
      plate: req.query.plate as string,
      brand: req.query.brand as string,
      model: req.query.model as string,
      Items: req.query.Items ? (req.query.Items as string).split(',') : undefined,
      km: req.query.km ? Number(req.query.km) : undefined,
      minYear: req.query.minYear ? Number(req.query.minYear) : undefined,
      maxYear: req.query.maxYear ? Number(req.query.maxYear) : undefined,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    };

    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;

    let orderByField: string | undefined = undefined;
    let orderByDirection: string = 'asc';

    if (typeof req.query.orderBy === 'string') {
      const orderByParts = req.query.orderBy.split('_');
      orderByField = orderByParts[0];
      orderByDirection = orderByParts[1] === 'desc' ? 'desc' : 'asc';
    }

    const orderBy = orderByField ? { [orderByField]: orderByDirection } : undefined;

    const { cars, totalCars, totalPages } = await carService.getAllCars(filters, orderBy, page, pageSize);

    if (cars.length === 0) {
      return res.status(404).json({ message: 'Nenhum carro encontrado.' });
    }

    res.json({
      cars,
      pagination: {
        totalCars,
        totalPages,
        currentPage: page,
        pageSize,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCarById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const car = await carService.getCarById(req.params.id);

    if (!car) {
      // Caso o carro não seja encontrado, retornar status 404
      return res.status(404).json({ error: 'Carro não encontrado' });
    }

    res.json(car);
  } catch (error) {
    next(error);
  }
};

export const updateCar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const car = await carService.getCarById(id);

    // Verifica se o carro existe
    if (!car) {
      return res.status(404).json({ error: 'Carro não encontrado' });
    }

    // Verifica se o status do carro é "excluído"
    if (car.status === 'DELETED') {
      return res.status(400).json({ error: 'Carros com status excluído não podem ser atualizados' });
    }

    // Restringe a atualização de status para apenas "ACTIVED" ou "INACTIVED"
    if (req.body.status && req.body.status !== 'ACTIVED' && req.body.status !== 'INACTIVED') {
      return res.status(400).json({ error: 'Status inválido. Permitido apenas ACTIVED ou INACTIVED' });
    }

    // Filtros dos campos permitidos para atualização (excluindo id, data de cadastro e status excluído)
    const dataToUpdate: any = { ...req.body };
    delete dataToUpdate.id;
    delete dataToUpdate.createdAt;

    const updatedCar = await carService.updateCar(id, dataToUpdate);

    res.json(updatedCar);
  } catch (error) {
    next(error);
  }
};

export const deleteCar = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Chama o serviço para realizar o soft delete do carro
    const result = await carService.deleteCar(id);

    // Retorna a resposta de sucesso ao cliente
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Erro no controller ao excluir o carro:', error.message);

    // Verifica o tipo de erro e responde de forma apropriada
    if (error.message === 'Carro inexistente') {
      return res.status(404).json({ message: error.message });
    } else if (error.message === 'Este carro já está excluído.') {
      return res.status(400).json({ message: error.message });
    } else {
      return res.status(500).json({ message: 'Erro ao excluir o carro' });
    }
  }
};

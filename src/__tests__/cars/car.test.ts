import { Request, Response, NextFunction } from "express";
import * as carController from "../../modules/cars/controllers/car.controller";
import * as carService from "../../modules/cars/services/car.service";
import { Status } from "@prisma/client";

jest.mock("../../modules/cars/services/car.service");

describe("Car Controller", () => {
  describe("createCar", () => {
    it("deve criar um novo carro e retornar status 201", async () => {
      const req = {
        body: {
          plate: "FRY9840",
          brand: "Toyota",
          model: "Corolla",
          km: 2000,
          year: 2020,
          Items: ["Airbag", "ABS"],
          price: 50000.0,
          status: "ACTIVED",
        },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const next = jest.fn();

      const newCar = {
        id: "1",
        plate: "ABC-1234",
        brand: "Toyota",
        model: "Corolla",
      };

      (carService.createCar as jest.Mock).mockResolvedValue(newCar);

      await carController.createCar(req, res, next);

      expect(carService.createCar).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(newCar);
    });

    // DEVE SURTIR ERROS
    // it("deve retornar status 500 quando ocorrer um erro", async () => {
    //   const req = {
    //     body: {
    //       plate: "FRY9840",
    //       brand: "Toyota",
    //       model: "Corolla",
    //       km: 2000,
    //       year: 2020,
    //       Items: ["Airbag", "ABS"],
    //       price: 50000.0,
    //       status: "ACTIVED",
    //     },
    //   } as Request;

    //   const res = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn(),
    //   } as any as Response;

    //   // const error = new Error("Erro ao criar carro");
    //   // (carService.createCar as jest.Mock).mockRejectedValue(error);

    //   await carController.createCar(req, res, jest.fn());

    //   expect(res.status).toHaveBeenCalledWith(500);
    //   // expect(res.json).toHaveBeenCalledWith({
    //   //   message: "Erro ao criar carro",
    //   //   details: error.message,
    //   // });
    // });
  });

  describe("getCars", () => {
    it("deve retornar uma lista de carros", async () => {
      const req = {
        query: {
          page: "1",
          pageSize: "10",
        },
      } as any as Request;

      const res = {
        json: jest.fn(),
      } as any as Response;

      const next = jest.fn();

      const cars = [
        {
          id: "1",
          plate: "FRY9840",
          brand: "Toyota",
          model: "Corolla",
          km: 2000,
          year: 2020,
          Items: ["Airbag", "ABS"],
          price: 50000.0,
          status: "ACTIVED",
        },
      ];

      const totalCars = 1;
      const totalPages = 1;

      (carService.getAllCars as jest.Mock).mockResolvedValue({
        cars,
        totalCars,
        totalPages,
      });

      await carController.getCars(req, res, next);

      expect(carService.getAllCars).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        cars,
        pagination: {
          totalCars,
          totalPages,
          currentPage: 1,
          pageSize: 10,
        },
      });
    });

    // DEVE SURTIR O ERRO
    it("deve retornar status 404 quando nenhum carro for encontrado", async () => {
      const req = {
        query: {},
      } as any as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const next = jest.fn();

      (carService.getAllCars as jest.Mock).mockResolvedValue({
        cars: [],
        totalCars: 0,
        totalPages: 0,
      });

      await carController.getCars(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nenhum carro encontrado.",
      });
    });

    it("deve chamar next com erro quando ocorrer um erro", async () => {
      const req = {
        query: {},
      } as any as Request;

      const res = {} as Response;
      const next = jest.fn();

      const error = new Error("Erro ao obter carros");

      (carService.getAllCars as jest.Mock).mockRejectedValue(error);

      await carController.getCars(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getCarById", () => {
    it("deve retornar o carro quando encontrado", async () => {
      const req = {
        params: { id: "1" },
      } as any as Request;

      const res = {
        json: jest.fn(),
      } as any as Response;

      const next = jest.fn();

      const car = {
        id: "1",
        plate: "FRY9840",
        brand: "Toyota",
        model: "Corolla",
        km: 2000,
        year: 2020,
        Items: ["Airbag", "ABS"],
        price: 50000.0,
        status: "ACTIVED",
      };

      (carService.getCarById as jest.Mock).mockResolvedValue(car);

      await carController.getCarById(req, res, next);

      expect(carService.getCarById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(car);
    });

    it("deve retornar status 404 quando o carro não for encontrado", async () => {
      const req = {
        params: { id: "1" },
      } as any as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const next = jest.fn();

      (carService.getCarById as jest.Mock).mockResolvedValue(null);

      await carController.getCarById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Carro não encontrado" });
    });

    it("deve chamar next com erro quando ocorrer um erro", async () => {
      const req = {
        params: { id: "1" },
      } as any as Request;

      const res = {} as Response;
      const next = jest.fn();

      const error = new Error("Erro ao obter carro");

      (carService.getCarById as jest.Mock).mockRejectedValue(error);

      await carController.getCarById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateCar", () => {
    it("deve atualizar o carro com sucesso", async () => {
      const req = {
        params: { id: "1" },
        body: {
          brand: "Honda",
          model: "Civic",
        },
      } as any as Request;

      const res = {
        json: jest.fn(),
      } as any as Response;

      const next = jest.fn();

      const existingCar = {
        id: "1",
        status: "ACTIVED",
      };

      const updatedCar = {
        id: "1",
        brand: "Honda",
        model: "Civic",
      };

      (carService.getCarById as jest.Mock).mockResolvedValue(existingCar);
      (carService.updateCar as jest.Mock).mockResolvedValue(updatedCar);

      await carController.updateCar(req, res, next);

      expect(carService.getCarById).toHaveBeenCalledWith("1");
      expect(carService.updateCar).toHaveBeenCalledWith(
        "1",
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith(updatedCar);
    });

    it("deve retornar 404 quando o carro não for encontrado", async () => {
      const req = {
        params: { id: "1" },
        body: {},
      } as any as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const next = jest.fn();

      (carService.getCarById as jest.Mock).mockResolvedValue(null);

      await carController.updateCar(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Carro não encontrado" });
    });

    it("deve retornar 400 quando o status do carro é DELETED", async () => {
      const req = {
        params: { id: "1" },
        body: {},
      } as any as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const next = jest.fn();

      const existingCar = {
        id: "1",
        status: "DELETED",
      };

      (carService.getCarById as jest.Mock).mockResolvedValue(existingCar);

      await carController.updateCar(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Carros com status excluído não podem ser atualizados",
      });
    });

    it("deve retornar 400 quando o status fornecido é inválido", async () => {
      const req = {
        params: { id: "1" },
        body: { status: "INVALID" },
      } as any as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const next = jest.fn();

      const existingCar = {
        id: "1",
        status: "ACTIVED",
      };

      (carService.getCarById as jest.Mock).mockResolvedValue(existingCar);

      await carController.updateCar(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Status inválido. Permitido apenas ACTIVED ou INACTIVED",
      });
    });

    it("deve chamar next com erro quando ocorrer um erro", async () => {
      const req = {
        params: { id: "1" },
        body: {},
      } as any as Request;

      const res = {} as Response;
      const next = jest.fn();

      const error = new Error("Erro ao atualizar carro");

      (carService.getCarById as jest.Mock).mockRejectedValue(error);

      await carController.updateCar(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteCar", () => {
    it("deve excluir o carro com sucesso", async () => {
      const req = {
        params: { id: "1" },
      } as any as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any as Response;

      const result = { message: "Carro excluído com sucesso" };

      (carService.deleteCar as jest.Mock).mockResolvedValue(result);

      await carController.deleteCar(req, res);

      expect(carService.deleteCar).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(result);
    });

    // it("deve retornar 404 quando o carro não existe", async () => {
    //   const req = {
    //     params: { id: "1" },
    //   } as any as Request;

    //   const res = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn(),
    //   } as any as Response;

    //   const error = new Error("Carro inexistente");
    //   (carService.deleteCar as jest.Mock).mockRejectedValue(error);

    //   await carController.deleteCar(req, res);

    //   expect(res.status).toHaveBeenCalledWith(404);
    //   expect(res.json).toHaveBeenCalledWith({ message: error.message });
    // });

    // it("deve retornar 400 quando o carro já está excluído", async () => {
    //   const req = {
    //     params: { id: "1" },
    //   } as any as Request;

    //   const res = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn(),
    //   } as any as Response;

    //   const error = new Error("Este carro já está excluído.");
    //   (carService.deleteCar as jest.Mock).mockRejectedValue(error);

    //   await carController.deleteCar(req, res);

    //   expect(res.status).toHaveBeenCalledWith(400);
    //   expect(res.json).toHaveBeenCalledWith({ message: error.message });
    // });

    // it("deve retornar 500 quando ocorrer um erro desconhecido", async () => {
    //   const req = {
    //     params: { id: "1" },
    //   } as any as Request;

    //   const res = {
    //     status: jest.fn().mockReturnThis(),
    //     json: jest.fn(),
    //   } as any as Response;

    //   const error = new Error("Erro desconhecido");
    //   (carService.deleteCar as jest.Mock).mockRejectedValue(error);

    //   await carController.deleteCar(req, res);

    //   expect(res.status).toHaveBeenCalledWith(500);
    //   expect(res.json).toHaveBeenCalledWith({
    //     message: "Erro ao excluir o carro",
    //   });
    // });
  });
});

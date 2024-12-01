import { Request, Response } from "express";
import OrderController from "../../modules/orders/controllers/order.controller";
import OrderService from "../../modules/orders/services/order.service";

jest.mock("../../modules/orders/services/order.service");

jest.mock("../../modules/orders/order.validation", () => ({
  updateOrderSchema: {
    validate: jest.fn(),
  },
}));

import { updateOrderSchema } from "../../modules/orders/order.validation";

describe("OrderController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    req = {};
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    res = {
      status: statusMock,
      json: jsonMock,
    };
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createOrder", () => {
    it("deve criar um pedido e retornar status 201", async () => {
      const orderData = {
        carId: "63fb4fea-a551-438c-b265-3525ad65559a",
        clientId: "480a6050-0472-4da2-9801-147c9ec665bb",
        zipcode: "13607730",
        city: "salvador",
        state: "BA",
      };
      const createdOrder = { id: "1", ...orderData };
      req.body = orderData;

      (OrderService.createOrder as jest.Mock).mockResolvedValue(createdOrder);

      await OrderController.createOrder(req as Request, res as Response);

      expect(OrderService.createOrder).toHaveBeenCalledWith(orderData);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(createdOrder);
    });

    it("deve retornar status 400 se ocorrer um erro", async () => {
      const errorMessage = "Erro ao criar pedido";
      req.body = {};
      (OrderService.createOrder as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await OrderController.createOrder(req as Request, res as Response);

      expect(OrderService.createOrder).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe("getOrderById", () => {
    it("deve obter um pedido pelo ID e retornar status 200", async () => {
      const orderId = "1";
      const order = { id: orderId };
      req.params = { id: orderId };

      (OrderService.getOrderById as jest.Mock).mockResolvedValue(order);

      await OrderController.getOrderById(req as Request, res as Response);

      expect(OrderService.getOrderById).toHaveBeenCalledWith(orderId);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(order);
    });

    it("deve retornar status 404 se o pedido não for encontrado", async () => {
      const orderId = "1";
      const errorMessage = "Pedido não encontrado";
      req.params = { id: orderId };

      (OrderService.getOrderById as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await OrderController.getOrderById(req as Request, res as Response);

      expect(OrderService.getOrderById).toHaveBeenCalledWith(orderId);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe("listOrders", () => {
    it("deve listar pedidos e retornar status 200", async () => {
      const orders = [{ id: "1" }, { id: "2" }];
      req.query = { page: "1", limit: "10" };

      (OrderService.listOrders as jest.Mock).mockResolvedValue(orders);

      await OrderController.listOrders(req as Request, res as Response);

      expect(OrderService.listOrders).toHaveBeenCalledWith({
        status: undefined,
        clientCpf: undefined,
        startDate: undefined,
        endDate: undefined,
        sort: "createdAt",
        order: "desc",
        page: 1,
        limit: 10,
      });
      expect(jsonMock).toHaveBeenCalledWith(orders);
    });

    // it("deve retornar status 500 se ocorrer um erro", async () => {
    //   const errorMessage = "Erro ao listar pedidos";
    //   req.query = {};
    //   (OrderService.listOrders as jest.Mock).mockRejectedValue(
    //     new Error(errorMessage)
    //   );

    //   await OrderController.listOrders(req as Request, res as Response);

    //   expect(statusMock).toHaveBeenCalledWith(500);
    //   expect(jsonMock).toHaveBeenCalledWith({
    //     message: "Erro ao listar pedidos",
    //   });
    // });
  });

  describe("updateOrder", () => {
    it("deve atualizar um pedido e retornar status 200", async () => {
      const orderId = "1";
      const orderData = { status: "confirmed" };
      const updatedOrder = { id: orderId, ...orderData };
      req.params = { id: orderId };
      req.body = orderData;

      (updateOrderSchema.validate as jest.Mock).mockReturnValue({
        error: null,
        value: orderData,
      });
      (OrderService.updateOrder as jest.Mock).mockResolvedValue(updatedOrder);

      await OrderController.updateOrder(req as Request, res as Response);

      expect(updateOrderSchema.validate).toHaveBeenCalledWith(req.body, {
        abortEarly: false,
      });
      expect(OrderService.updateOrder).toHaveBeenCalledWith(orderId, orderData);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(updatedOrder);
    });

    it("deve retornar status 400 se a validação falhar", async () => {
      const orderId = "1";
      const validationError = { details: [{ message: "Erro de validação" }] };
      req.params = { id: orderId };
      req.body = { invalidField: "invalidValue" };

      (updateOrderSchema.validate as jest.Mock).mockReturnValue({
        error: validationError,
        value: null,
      });

      await OrderController.updateOrder(req as Request, res as Response);

      expect(updateOrderSchema.validate).toHaveBeenCalledWith(req.body, {
        abortEarly: false,
      });
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ errors: ["Erro de validação"] });
    });

    it("deve retornar status 400 se ocorrer um erro ao atualizar", async () => {
      const orderId = "1";
      const orderData = { status: "confirmed" };
      const errorMessage = "Erro ao atualizar pedido";
      req.params = { id: orderId };
      req.body = orderData;

      (updateOrderSchema.validate as jest.Mock).mockReturnValue({
        error: null,
        value: orderData,
      });
      (OrderService.updateOrder as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await OrderController.updateOrder(req as Request, res as Response);

      expect(updateOrderSchema.validate).toHaveBeenCalledWith(req.body, {
        abortEarly: false,
      });
      expect(OrderService.updateOrder).toHaveBeenCalledWith(orderId, orderData);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });
  });

  describe("deleteOrder", () => {
    it("deve deletar um pedido e retornar status 200", async () => {
      const orderId = "1";
      const canceledOrder = { id: orderId, status: "cancelado" };
      req.params = { id: orderId };

      (OrderService.deleteOrder as jest.Mock).mockResolvedValue(canceledOrder);

      await OrderController.deleteOrder(req as Request, res as Response);

      expect(OrderService.deleteOrder).toHaveBeenCalledWith(orderId);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(canceledOrder);
    });

    it("deve retornar status 400 se ocorrer um erro ao deletar", async () => {
      const orderId = "1";
      const errorMessage = "Erro ao deletar pedido";
      req.params = { id: orderId };

      (OrderService.deleteOrder as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await OrderController.deleteOrder(req as Request, res as Response);

      expect(OrderService.deleteOrder).toHaveBeenCalledWith(orderId);
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
    });
  });
});

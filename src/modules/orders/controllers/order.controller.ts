import { Request, Response } from 'express';
import OrderService from '../services/order.service';
import { updateOrderSchema } from '../order.validation';

class OrderController {
  public async createOrder(req: Request, res: Response): Promise<Response> {
    try {
      const order = await OrderService.createOrder(req.body);
      return res.status(201).json(order);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  public async getOrderById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderById(id);
      return res.status(200).json(order);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  public async listOrders(req: Request, res: Response): Promise<Response> {
        try {
            // Recebendo parâmetros de filtro e paginação da requisição
            const {
                status,
                clientCpf,
                startDate,
                endDate,
                sort = 'createdAt',
                order = 'desc',
                page = 1,
                limit = 10
            } = req.query;

            // Chamando o serviço para listar os pedidos com os filtros aplicados
            const orders = await OrderService.listOrders({
                status: status as string,
                clientCpf: clientCpf as string,
                startDate: startDate as string,
                endDate: endDate as string,
                sort: sort as string,
                order: order as 'asc' | 'desc',
                page: parseInt(page as string),
                limit: parseInt(limit as string)
            });

            return res.json(orders);
        } catch (error) {
            console.error('Erro ao listar pedidos:', error);
            return res.status(500).json({ message: 'Erro ao listar pedidos' });
        }
  }

  async updateOrder(req: Request, res: Response) {
    const { id } = req.params;
    const { error, value } = updateOrderSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details.map((e) => e.message) });
    }

    try {
      const order = await OrderService.updateOrder(id, value);
      return res.status(200).json(order);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  public async deleteOrder(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const canceledOrder = await OrderService.deleteOrder(id);
      return res.status(200).json(canceledOrder);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
  
}

export default new OrderController();


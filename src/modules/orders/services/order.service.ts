import { prisma } from "../database";
import axios from 'axios';

interface ListOrdersParams {
    status?: string;
    clientCpf?: string;
    startDate?: string;
    endDate?: string;
    sort: string;
    order: 'asc' | 'desc';
    page: number;
    limit: number;
}

class OrderService {
  public async createOrder(data: { carId: string; clientId: string }) {
    const { carId, clientId } = data;

    // Verifica se o cliente já tem um pedido aberto
    const existingOrder = await prisma.order.findFirst({
      where: { clientId, status: 'OPEN' },
    });

    if (existingOrder) {
      throw new Error('Este cliente já possui um pedido aberto.');
    }

    // Cria o pedido com os valores iniciais
    const order = await prisma.order.create({
      data: {
        clientId,
        carId,
        status: 'OPEN',
        totalValue: 0,
        createdAt: new Date(),
        zipcode: '',
        city: '',
        state: '',
      },
    });

    return order;
  }

  public async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
            cpf: true,
          },
        },
        car: {
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            km: true,
            Items: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    return order;
  }

  public async listOrders(params: ListOrdersParams) {
        const { status, clientCpf, startDate, endDate, sort, order, page, limit } = params;

        // Configuração de filtros dinamicamente
        const filters: any = {};

        if (status) {
            filters.status = status;
        }

        if (clientCpf) {
            filters.client = { cpf: clientCpf };
        }

        if (startDate && endDate) {
            filters.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        // Paginação e ordenação
        const skip = (page - 1) * limit;
        const orders = await prisma.order.findMany({
            where: filters,
            include: {
                client: { select: { id: true, fullName: true, cpf: true } },
                car: { select: { id: true, brand: true, model: true, year: true, km: true } }
            },
            orderBy: { [sort]: order },
            skip,
            take: limit
        });

        // Total de pedidos para cálculo de paginação
        const totalOrders = await prisma.order.count({ where: filters });

        return {
            orders,
            pagination: {
                total: totalOrders,
                page,
                pages: Math.ceil(totalOrders / limit)
            }
        };
    }

    async updateOrder(id: string, data: any) {
    // Obtenha o pedido atual do banco de dados
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new Error("Pedido não encontrado.");
    }

    // Verifique se o pedido está aberto
    if (existingOrder.status !== 'OPEN') {
      throw new Error("O status do pedido só pode ser alterado se o pedido estiver aberto.");
    }

    // Validação de CEP e preenchimento de cidade e estado pela API do ViaCEP
    if (data.zipcode) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${data.zipcode}/json/`);
        if (response.data.erro) {
          throw new Error('CEP não encontrado.');
        }

        const { uf, localidade } = response.data;

        // Lista de estados permitidos
        const estadosPermitidos = ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'];
        if (!estadosPermitidos.includes(uf)) {
          throw new Error('No momento não temos filiais nessa região.');
        }

        // Atualizando os dados com a resposta da API do ViaCEP
        data.city = localidade;
        data.state = uf;
      } catch (error: any) {
        throw new Error(error.message || 'Erro ao consultar o CEP.');
      }
    }

    // Verificação específica para o status APPROVED
    if (data.status === 'APROVED') {
      if (!data.zipcode || !data.city || !data.state || !data.startDate || !data.endDate) {
        throw new Error("Para aprovar o pedido, todos os campos devem estar preenchidos.");
      }
    }

    // Verificação específica para o status CANCELED
    if (data.status === 'CANCELED') {
      data.cancellationDate = new Date();
    }

    // Formatação de datas para o tipo esperado pelo Prisma
    const formattedData: any = {
      ...data,
      startDate: data.startDate ? { set: new Date(data.startDate) } : undefined,
      endDate: data.endDate ? { set: new Date(data.endDate) } : undefined,
    };

    // Remove campos nulos para evitar conflito com a estrutura do Prisma
    for (const key in formattedData) {
      if (formattedData[key] === undefined) {
        delete formattedData[key];
      }
    }

    // Atualiza o pedido no banco de dados
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { ...formattedData, uptadedAt: new Date() },
    });

    return updatedOrder;
  }

  async deleteOrder(id: string) {
    // Verifica se o pedido existe e está aberto
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      throw new Error("Pedido não encontrado.");
    }

    if (existingOrder.status !== 'OPEN') {
      throw new Error("Apenas pedidos com status 'Aberto' podem ser cancelados.");
    }

    // Atualiza o status do pedido para "CANCELED" e define a data de cancelamento
    const canceledOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELED',
        cancellationDate: new Date(),
      },
    });

    return canceledOrder;
  }

}

export default new OrderService();

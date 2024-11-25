import { Client, Prisma } from "@prisma/client";
import { prisma } from "../database";

interface SearchParams {
    nome?: string;
    email?: string;
    cpf?: string;
    excluido?: Date; // Data de exclusão
    page: number;
    limit: number;
    orderBy?: Array<'fullName' | 'email' | 'cpf' | 'excluido'>; // Array para orderBy
}

class ListClientService {
    public async listClient({
        nome,
        email,
        cpf,
        excluido,
        page,
        limit,
        orderBy,
    }: SearchParams): Promise<Client[]> {
        const where: Prisma.ClientWhereInput = {
            ...(cpf && { cpf }),
            ...(nome && { fullName: { contains: nome } }),
            ...(email && { email: { contains: email } }),
            // Sem filtrar por deletedAt se não houver um filtro de exclusão
        };

        // Se o parâmetro excluido for passado, adiciona a lógica de filtragem
        if (excluido) {
            where.deletedAt = {
                gte: new Date(excluido.getFullYear(), excluido.getMonth(), 1),
                lt: new Date(excluido.getFullYear(), excluido.getMonth() + 1, 1),
            };
        }
        
        else{
            if(!orderBy?.includes('excluido')){
                where.deletedAt = null
            }
            
        }

        const clients = await prisma.client.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
        });

        // Define orderCriteria com base no orderBy
        const orderCriteria = orderBy && orderBy.length > 0 ? orderBy : ['fullName'];

        // Ordena de acordo com os parâmetros
        clients.sort((a, b) => {
            for (const order of orderCriteria) {
                let comparison = 0;

                switch (order) {
                    case 'fullName':
                        comparison = a.fullName.localeCompare(b.fullName);
                        break;
                    case 'email':
                        comparison = a.email.localeCompare(b.email);
                        break;
                    case 'cpf':
                        comparison = (b.cpf || '').localeCompare(a.cpf || ''); // Do maior para o menor
                        break;
                    case 'excluido':
                        // Prioriza clientes com deletedAt diferente de null
                        comparison = (b.deletedAt ? 1 : 0) - (a.deletedAt ? 1 : 0);
                        break;
                }

                // Retorna a comparação se não for zero
                if (comparison !== 0) {
                    return comparison;
                }
            }

            return 0; // Se todas as comparações forem iguais
        });

        return clients;
    }
}

export default new ListClientService();

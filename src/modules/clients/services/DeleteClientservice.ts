import { Client } from "@prisma/client";
import { prisma } from "../database";

class DeleteClientService{
    public async deleteClient(id: string): Promise<Client>{
        const client = await prisma.client.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            }
        })

        if(!client){
            throw new Error('Client not found');
        }

        return client;
    }
}

export default new DeleteClientService()
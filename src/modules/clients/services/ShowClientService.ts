import { Client } from "@prisma/client";
import { prisma } from "../database";


class ShowClientService{
    public async showClient(id: string): Promise<Client | null>{
        const client = await prisma.client.findUnique({
            where: {
                id,
            }
        })

        return client;
    }
}

export default new ShowClientService();
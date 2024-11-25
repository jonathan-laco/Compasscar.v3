import { Client } from "@prisma/client";
import { prisma } from "../database";

interface IRequest {
    fullName: string;
    birthDate: Date; // ou Date, dependendo de como você quer tratar
    cpf: string;
    email: string;
    phone: string; 
}

class CreateClientService {
    public async createClient(data: IRequest): Promise<Client>{
        data.birthDate = new Date(data.birthDate);
        const clientExists = await prisma.client.findUnique({
            where: {
                cpf: data.cpf,
                email: data.email
           }
        });

        // Validação do CPF
        if (data.cpf && !this.isValidCPF(data.cpf)) {
            throw new Error('Invalid cpf format');
        }
 
        // Validação do Email
        if (data.email && !this.isValidEmail(data.email)) {
            throw new Error('Invalid email format');
        }


        if(clientExists){
            
            throw new Error('Client already exists');
            
        }


        const client = await prisma.client.create({
            data: {
                ...data,
            },
        });

        return client;

    }

    private isValidCPF(cpf: string): boolean {
        const cpfRegex = /^\d{11}$/;
        if (!cpfRegex.test(cpf) || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }
        return true;
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.endsWith('.com');
    }
}

export default new CreateClientService();
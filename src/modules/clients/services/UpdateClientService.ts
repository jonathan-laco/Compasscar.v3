import { Client } from "@prisma/client";
import { prisma } from "../database";

interface IRequest {
    id?: string; // ID opcional
    fullName?: string;
    cpf?: string;
    email?: string;
    phone?: string;
    birthDate?: Date;
}

class UpdateClientService {
    public async updateClient({
        id,
        fullName,
        cpf,
        email,
        phone,
        birthDate,
    }: IRequest): Promise<Client> {

        const clientExist = await prisma.client.findUnique({
            where: { id },
        });

        if (!clientExist ) {
            throw new Error('Client not found');
        }

        if (cpf && !this.isValidCPF(cpf)) {
            throw new Error('Invalid cpf format');
        }
 
        // Validação do Email
        if (email && !this.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }

        const data: IRequest = {};
        if (fullName) data.fullName = fullName;
        if (cpf) data.cpf = cpf;
        if (email) data.email = email;
        if (phone) data.phone = phone;
        if (birthDate) data.birthDate = new Date(birthDate);

        const clientUpdate = await prisma.client.update({
            where: { id },
            data,
        });

        return clientUpdate;
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

export default new UpdateClientService();

import { Request, Response } from 'express';
import CreateClient from '../services/CreateClient';
import ListClientService from '../services/ListClientService';
import ShowClientService from '../services/ShowClientService';
import UpdateClientService from '../services/UpdateClientService';
import DeleteClientservice from '../services/DeleteClientservice';

class ClientController {
    public async create(req: Request, res: Response): Promise<Response | undefined> {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição não está definido.' });
        }
 
        const { fullName, birthDate, cpf, email, phone } = req.body;
        try{
            const client = await CreateClient.createClient({ fullName, birthDate, cpf, email, phone });
 
            return res.status(201).json(client);
        } catch (err) {
            if (err instanceof Error) {
              switch (err.message) {
                case 'Invalid email format':
                  res.status(400).json({ message: 'Invalid email format' });
                  break;
                case 'Invalid cpf format':
                  res.status(404).json({ message: 'Invalid cpf format' });
                  break;
                case 'Client already exists':
                  res.status(400).json({message: 'Client already exist'});
                default:
                  res.status(500).json({ message: 'An unexpected error occurred: ' + err.message });
              }
            } else {
              res.status(500).json({ message: 'An unexpected error occurred.' });
            }
          }
    }

    public async list(req: Request, res: Response): Promise<Response> {
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 15;

        const nome = typeof req.query.nome === 'string' ? req.query.nome : undefined;
        const email = typeof req.query.email === 'string' ? req.query.email : undefined;
        const cpf = typeof req.query.cpf === 'string' ? req.query.cpf : undefined;
        const excluido = req.query.excluido ? new Date(req.query.excluido as string) : undefined;

        const validOrderByValues: Array<'fullName' | 'email' | 'cpf' | 'excluido'> = ['fullName', 'email', 'cpf', 'excluido'];

        let orderBy: Array<'fullName' | 'email' | 'cpf' | 'excluido'> = [];

        if (typeof req.query.orderBy === 'string') {
            if (validOrderByValues.includes(req.query.orderBy as 'fullName' | 'email' | 'cpf' | 'excluido')) {
                orderBy.push(req.query.orderBy as 'fullName' | 'email' | 'cpf' | 'excluido');
            }
        } else if (Array.isArray(req.query.orderBy)) {
            orderBy = req.query.orderBy
                .filter(item => validOrderByValues.includes(item as 'fullName' | 'email' | 'cpf' | 'excluido')) as Array<'fullName' | 'email' | 'cpf' | 'excluido'>;
        }

        const clients = await ListClientService.listClient({ nome, email, cpf, excluido, page, limit, orderBy });

        return res.status(200).json(clients);
    }

    public async show(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        const client = await ShowClientService.showClient(id);

        if (!client) {
            return res.status(404).json({ error: 'Client Not Found' });
        }

        return res.status(200).json(client);
    }

    public async update(req: Request, res: Response): Promise<Response | undefined> {
        const { id } = req.params;
 
        const { fullName, email, cpf, phone, birthDate } = req.body;
 
        try {
            const client = await UpdateClientService.updateClient({ id, fullName, email, cpf, phone, birthDate });
 
            return res.status(200).json(client);
 
        }catch (err) {
            if (err instanceof Error) {
              switch (err.message) {
                case 'Invalid email format':
                  res.status(400).json({ message: 'Invalid email format' });
                  break;
                case 'Invalid cpf format':
                  res.status(404).json({ message: 'Invalid cpf format' });
                  break;
                case 'Client not found':
                  res.status(400).json({message: 'Client not found'});
                default:
                  res.status(500).json({ message: 'An unexpected error occurred: ' + err.message });
              }
            } else {
              res.status(500).json({ message: 'An unexpected error occurred.' });
            }
          }
       
    }

    public async delete(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        try{
            const client = await DeleteClientservice.deleteClient(id);
            
            return res.status(200).json();
        } catch {
            return res.status(404).json({error: 'Client Not Found'});
        }   

    }
}

export default new ClientController();

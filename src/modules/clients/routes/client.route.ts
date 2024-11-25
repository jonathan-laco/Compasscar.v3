//@ts-nocheck
import { Router } from "express"; 
import ClientController from "../controllers/ClientController";
import { authenticateToken } from "../../auth/auth.middleware";

const clientRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Operações relacionadas a clientes
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /clients:
 *   post:
 *     tags: [Clients]
 *     summary: Criar um novo cliente
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Jaum da Silva"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               cpf:
 *                 type: string
 *                 example: "12345678901"
 *               email:
 *                 type: string
 *                 example: "joao@example.com"
 *               phone:
 *                 type: string
 *                 example: "11987654321"
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 birthDate:
 *                   type: string
 *                   format: date
 *                 cpf:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *       400:
 *         description: Dados inválidos
 */
clientRouter.post('/', authenticateToken, ClientController.create);

/**
 * @swagger
 * /clients:
 *   get:
 *     tags: [Clients]
 *     summary: Listar todos os clientes ou clientes excluídos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: orderBy
 *         required: false
 *         description: Filtra os resultados. Use "excluido" para listar apenas clientes excluídos.
 *         schema:
 *           type: string
 *           example: "excluido"
 *     responses:
 *       200:
 *         description: Lista de clientes ou clientes excluídos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   fullName:
 *                     type: string
 *                   birthDate:
 *                     type: string
 *                     format: date
 *                   cpf:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   excluded:
 *                     type: boolean
 *                     description: Indica se o cliente foi excluído
 */
clientRouter.get('/', authenticateToken, ClientController.list);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     tags: [Clients]
 *     summary: Obter cliente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do cliente a ser buscado
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 fullName:
 *                   type: string
 *                 birthDate:
 *                   type: string
 *                   format: date
 *                 cpf:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *       404:
 *         description: Cliente não encontrado
 */
clientRouter.get('/:id', authenticateToken, ClientController.show);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     tags: [Clients]
 *     summary: Atualizar um cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do cliente a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "João da Silva Atualizado"
 *               email:
 *                 type: string
 *                 example: "joao_atualizado@example.com"
 *               phone:
 *                 type: string
 *                 example: "11987654322"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       400:
 *         description: Dados inválidos
 */
clientRouter.put('/:id', authenticateToken, ClientController.update);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     tags: [Clients]
 *     summary: Excluir um cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do cliente a ser excluído
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cliente excluído com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       400:
 *         description: Cliente já excluído
 */
clientRouter.delete('/:id', authenticateToken, ClientController.delete);

export default clientRouter;

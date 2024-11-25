// orders
//@ts-nocheck
import { Router } from 'express';
import * as orderSchema from '../order.validation';
import { authenticateToken } from '../../auth/auth.middleware';
import { validateOrderCreation } from '../order.middleware';
import orderController from '../controllers/order.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operações relacionadas a usuários
 */

/**
 * @swagger
 * tags:
 *   name: Cars
 *   description: Operações relacionadas a carros
 */

/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Operações relacionadas a clientes
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Operações relacionadas a pedidos
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
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Criar um novo pedido
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               carId:
 *                 type: string
 *                 example: "car12345"
 *               clientId:
 *                 type: string
 *                 example: "client12345"
 *               zipcode:
 *                 type: string
 *                 example: "12345678"
 *               city:
 *                 type: string
 *                 example: "São Paulo"
 *               state:
 *                 type: string
 *                 example: "SP"
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Obter pedido por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pedido a ser buscado
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido não encontrado
 * 
 *   patch:
 *     tags: [Orders]
 *     summary: Atualizar um pedido
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pedido a ser atualizado
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               zipcode:
 *                 type: string
 *                 example: "12345678"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *       404:
 *         description: Pedido não encontrado
 *       400:
 *         description: Dados inválidos
 * 
 *   delete:
 *     tags: [Orders]
 *     summary: Excluir um pedido
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do pedido a ser excluído
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Pedido excluído com sucesso
 *       404:
 *         description: Pedido não encontrado
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Listar todos os pedidos
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   clientId:
 *                     type: string
 *                   items:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: string
 *                         quantity:
 *                           type: integer
 *                   total:
 *                     type: number
 */

router.post('/', authenticateToken, validateOrderCreation, orderController.createOrder);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.get('/', authenticateToken, orderController.listOrders);
router.patch('/:id', authenticateToken, orderController.updateOrder);
router.delete('/:id', authenticateToken, orderController.deleteOrder);

export default router;

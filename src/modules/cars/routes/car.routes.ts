// cars

//@ts-nocheck
import { Router } from 'express';
import * as carController from '../controllers/car.controller';
import { validate } from '../car.middleware';
import { carSchema } from '../car.validation';
import { authenticateToken } from '../../auth/auth.middleware';

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
 * /cars:
 *   post:
 *     tags: [Cars]
 *     summary: Criar um novo carro
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plate:
 *                 type: string
 *                 example: ABC-1234
 *               brand:
 *                 type: string
 *                 example: Toyota
 *               model:
 *                 type: string
 *                 example: Corolla
 *               year:
 *                 type: integer
 *                 example: 2020
 *               km:
 *                 type: integer
 *                 example: 15000
 *               price:
 *                 type: integer
 *                 example: 90000
 *               Items:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Ar-condicionado", "Direção hidráulica"]
 *               status:
 *                 type: string
 *                 example: ACTIVED
 *     responses:
 *       201:
 *         description: Carro criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', authenticateToken, validate(carSchema), carController.createCar);

/**
 * @swagger
 * /cars:
 *   get:
 *     tags: [Cars]
 *     summary: Listar todos os carros
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   plate:
 *                     type: string
 *                     example: ABC-1234
 *                   brand:
 *                     type: string
 *                     example: Toyota
 *                   model:
 *                     type: string
 *                     example: Corolla
 *                   year:
 *                     type: integer
 *                     example: 2020
 *                   km:
 *                     type: integer
 *                     example: 15000
 *                   price:
 *                     type: integer
 *                     example: 90000
 *                   Items:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Ar-condicionado", "Direção hidráulica"]
 *                   status:
 *                     type: string
 *                     example: ACTIVED
 */
router.get('/', authenticateToken, carController.getCars);

/**
 * @swagger
 * /cars/{id}:
 *   get:
 *     tags: [Cars]
 *     summary: Obter carro por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Carro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plate:
 *                   type: string
 *                   example: ABC-1234
 *                 brand:
 *                   type: string
 *                   example: Toyota
 *                 model:
 *                   type: string
 *                   example: Corolla
 *                 year:
 *                   type: integer
 *                   example: 2020
 *                 km:
 *                   type: integer
 *                   example: 15000
 *                 price:
 *                   type: integer
 *                   example: 90000
 *                 Items:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Ar-condicionado", "Direção hidráulica"]
 *                 status:
 *                   type: string
 *                   example: ACTIVED
 *       404:
 *         description: Carro não encontrado
 */
router.get('/:id', authenticateToken, carController.getCarById);

/**
 * @swagger
 * /cars/{id}:
 *   put:
 *     tags: [Cars]
 *     summary: Atualizar um carro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do carro a ser atualizado
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plate:
 *                 type: string
 *                 example: ABC-5678
 *               brand:
 *                 type: string
 *                 example: Honda
 *               model:
 *                 type: string
 *                 example: Civic
 *               year:
 *                 type: integer
 *                 example: 2021
 *               km:
 *                 type: integer
 *                 example: 12000
 *               price:
 *                 type: integer
 *                 example: 95000
 *               Items:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Sensores de estacionamento", "Navegação"]
 *               status:
 *                 type: string
 *                 example: ACTIVED
 *     responses:
 *       200:
 *         description: Carro atualizado com sucesso
 *       404:
 *         description: Carro não encontrado
 *       400:
 *         description: Dados inválidos
 */
router.put('/:id', authenticateToken, validate(carSchema), carController.updateCar);

/**
 * @swagger
 * /cars/{id}:
 *   delete:
 *     tags: [Cars]
 *     summary: Excluir um carro
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do carro a ser excluído
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       204:
 *         description: Carro excluído com sucesso
 *       404:
 *         description: Carro não encontrado
 */
router.delete('/:id', authenticateToken, carController.deleteCar);

export default router;

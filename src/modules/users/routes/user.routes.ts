//@ts-nocheck
import { Router } from "express";
import UserController from "../controllers/UserController";
import { createUserValidator } from "../middlewares/createUserValidator";
import updateUserValidator from "../middlewares/updateUserValidator";
import { authenticateToken } from "../../auth/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operações relacionadas a usuários
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
 * /users/create:
 *   post:
 *     tags: [Users]
 *     summary: Criar um novo usuário
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
 *                 example: "Maria Silva"
 *               email:
 *                 type: string
 *                 example: "maria.silva@example.com"
 *               password:
 *                 type: string
 *                 example: "senhaSegura123"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: "USER"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Listar todos os usuários, incluindo removidos
 *     parameters:
 *       - in: query
 *         name: isDeleted
 *         required: false
 *         description: Filtrar usuários removidos (true para visualizar removidos)
 *         schema:
 *           type: boolean
 *           example: true
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
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
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   isDeleted:
 *                     type: boolean
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obter usuário por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser buscado
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */

/**
 * @swagger
 * /users/update/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Atualizar um usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser atualizado
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
 *                 example: "Maria Betania"
 *               email:
 *                 type: string
 *                 example: "mariabetania@gmail.com"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /users/delete/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Excluir um usuário
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário a ser excluído
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 *       404:
 *         description: Usuário não encontrado
 *       400:
 *         description: Usuário já excluído
 */

router.post("/create", authenticateToken, createUserValidator, UserController.createUser);
router.get("/", authenticateToken, UserController.listUsers); // Aqui já está a lógica para isDeleted
router.get("/:id", authenticateToken, UserController.getUserById);
router.patch("/update/:id", authenticateToken, updateUserValidator, UserController.updateUser);
router.delete("/delete/:id", authenticateToken, UserController.deleteUser);

export default router;

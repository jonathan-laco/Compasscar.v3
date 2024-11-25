import { Router } from 'express';
import { login } from '../controllers/auth.controller';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Autenticação
 *     description: Operações relacionadas à autenticação
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login do usuário
 *     description: Realiza login com email e senha para receber um token de autenticação.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', login);

export default router;

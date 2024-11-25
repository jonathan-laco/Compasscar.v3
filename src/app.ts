import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/routes/auth.routes';
import userRoutes from './modules/users/routes/user.routes';
import clientRouter from './modules/clients/routes/client.route';
import carRoutes from './modules/cars/routes/car.routes';
import orderRoutes from './modules/orders/routes/order.routes';
import { setupSwagger } from '../docs/swaggerConfig'; // Importa o Swagger

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('API CompassCarV2 is running!');
});

// Configuração do Swagger
setupSwagger(app);

// Rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/clients', clientRouter);
app.use('/cars', carRoutes);
app.use('/orders', orderRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

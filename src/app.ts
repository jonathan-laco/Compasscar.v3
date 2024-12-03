import express, { Request, Response } from "express";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/routes/auth.routes";
import userRoutes from "./modules/users/routes/user.routes";
import clientRouter from "./modules/clients/routes/client.route";
import carRoutes from "./modules/cars/routes/car.routes";
import orderRoutes from "./modules/orders/routes/order.routes";
import { setupSwagger } from "../docs/swaggerConfig"; // Importa o Swagger

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota principal com detalhe
app.get("/", (req: Request, res: Response) => {
  res.send(`
    <html>
      <head>
        <title>CompassCarV3</title>
        <style>
          body{background-color: #fafafa;}
        </style>
      </head>
      <body>
        <center>
          <h1>API COMPASSCAR V3</h1>
          <p>Welcome to our API!</p>
          
          <img src="https://i.imgur.com/Q13LinX.gif" alt="CompassCar GIF" style="max-width: 100%; height: auto;">
        </center>
      </body>
    </html>
  `);
});

setupSwagger(app);

// Rotas
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/clients", clientRouter);
app.use("/cars", carRoutes);
app.use("/orders", orderRoutes);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

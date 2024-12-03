import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
require("dotenv").config();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "3.0.0",
      description:
        "API CompassCar: Gerenciamento seguro e eficiente de clientes, veículos e pedidos.",
    },
    servers: [
      {
        url: process.env.SERVER_URL || "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/modules/**/*.ts"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

import request from "supertest";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../../modules/auth/auth.middleware";

jest.mock("jsonwebtoken");

describe("authenticateToken middleware", () => {
  const app = express();
  app.use(express.json());

  // Rota para simular o uso do middleware
  app.get("/protected", authenticateToken, (req: Request, res: Response) => {
    res.status(200).json({ message: "Access granted", user: req.user });
  });

  test("Deve retornar 401 se o token não for fornecido", async () => {
    const response = await request(app).get("/protected");
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Token not provided.");
  });

  test("Deve retornar 403 se o token for inválido", async () => {
    (jwt.verify as jest.Mock).mockImplementationOnce(
      (token, secret, callback) => {
        callback(new Error("Invalid token"), null);
      }
    );

    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalidtoken");

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("error", "Invalid token.");
  });

  test("Deve permitir acesso com um token válido", async () => {
    const mockUser = { id: 1, username: "testuser" };
    (jwt.verify as jest.Mock).mockImplementationOnce(
      (token, secret, callback) => {
        callback(null, mockUser);
      }
    );

    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer validtoken");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Access granted");
    expect(response.body).toHaveProperty("user", mockUser);
  });
});

import request from "supertest";
import express from "express";
import { login } from "../../modules/auth/controllers/auth.controller";
import { authenticateUser } from "../../modules/auth/services/auth.service";

jest.mock("../../modules/auth/services/auth.service");

const app = express();
app.use(express.json());
app.post("/login", login);

describe("POST /login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar 200 e um token para credenciais válidas", async () => {
    (authenticateUser as jest.Mock).mockResolvedValue("valid-token");

    const response = await request(app)
      .post("/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe("valid-token");
  });

  it("deve retornar 400 para entrada inválida", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "invalid-email", password: "short" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email must be a valid email address.");
  });

  it("deve retornar 401 para email ou senha inválidos", async () => {
    (authenticateUser as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("deve retornar 403 se o usuário estiver deletado", async () => {
    const error = new Error("User is deleted");
    (authenticateUser as jest.Mock).mockRejectedValue(error);

    const response = await request(app)
      .post("/login")
      .send({ email: "deleted@example.com", password: "password123" });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("User is deleted");
  });

  it("deve retornar 500 para erros inesperados", async () => {
    (authenticateUser as jest.Mock).mockRejectedValue(
      new Error("Unexpected error")
    );

    const response = await request(app)
      .post("/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe(
      "An unexpected error occurred: Unexpected error"
    );
  });
});

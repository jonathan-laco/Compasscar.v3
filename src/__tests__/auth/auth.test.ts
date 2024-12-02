import request from "supertest";
import app from "../../app";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

jest.mock("@prisma/client", () => {
  const mUser = {
    create: jest.fn(),
    findUnique: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: mUser,
    })),
  };
});

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("fakeToken123"),
}));

describe("Auth Module - Login Route Tests", () => {
  const mockUser = {
    id: "userId123",
    fullName: "Joel",
    email: "joel@tlou.com",
    password: "joel123",
    Role: "ADMIN",
    deletedAt: null,
  };

  it("Deve retornar erro se o email for inválido", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "invalidemail", password: "joel123" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email must be a valid email address.");
  });

  it("Deve retornar erro se o email não existir", async () => {
    const prisma = new PrismaClient();

    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "nonexistent@tlou.com", password: "joel123" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Email not found");
  });

  it("Deve retornar erro se a senha estiver incorreta", async () => {
    const prisma = new PrismaClient();
    const incorrectPassword = "wrongpassword";

    const correctPasswordHash = bcrypt.hashSync(mockUser.password, 10);

    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      ...mockUser,
      password: correctPasswordHash,
    });

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "joel@tlou.com", password: incorrectPassword });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid password");
  });

  it("Deve retornar erro se a senha for menor que 6 caracteres", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "joel@tlou.com", password: "123" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Password must be at least 6 characters long."
    );
  });

  it("Deve retornar token se as credenciais forem válidas", async () => {
    const prisma = new PrismaClient();

    const correctPasswordHash = bcrypt.hashSync(mockUser.password, 10);

    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      ...mockUser,
      password: correctPasswordHash,
    });

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "joel@tlou.com", password: "joel123" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});

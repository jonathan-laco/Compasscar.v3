import { Role } from "@prisma/client";
import CreateUserService from "../../modules/users/services/createUserService"; // Ajuste o caminho conforme necessário
import CreateUserRepository from "../../modules/users/databases/createUserRepository"; // Ajuste o caminho conforme necessário
import UpdateUserService from "../../modules/users/services/updateUserService"; // Ajuste o caminho conforme necessário
import UpdateUserRepository from "../../modules/users/databases/updateUserRepository"; // Ajuste o caminho conforme necessário
import deleteUserService from "../../modules/users/services/deleteUserService"; // Ajuste o caminho conforme necessário
import deleteUserRepository from "../../modules/users/databases/deleteUserRepository"; // Ajuste o caminho conforme necessário
import GetUserByIdService from "../../modules/users/services/getIdUserService"; // Ajuste o caminho conforme necessário
import GetUserByIdRepository from "../../modules/users/databases/getIdUserRepository"; // Ajuste o caminho conforme necessário
import bcrypt from "bcryptjs"; // Substituindo bcrypt por bcryptjs

jest.mock("../../modules/users/databases/createUserRepository");
jest.mock("../../modules/users/databases/updateUserRepository");
jest.mock("../../modules/users/databases/deleteUserRepository");
jest.mock("../../modules/users/databases/getIdUserRepository");
jest.mock("bcryptjs");

describe("User Services", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar um usuário com sucesso", async () => {
    const mockUser = {
      id: "1",
      fullName: "João Silva",
      email: "joao.silva@email.com",
      password: "hashedPassword",
      Role: "USER",
      deletedAt: null,
    };

    const data = {
      fullName: "João Silva",
      email: "joao.silva@email.com",
      password: "senha123",
      Role: "USER" as Role,
    };

    (CreateUserRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);

    (CreateUserRepository.createUser as jest.Mock).mockResolvedValue(mockUser);

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    const result = await CreateUserService.createUser(data);

    expect(CreateUserRepository.findUserByEmail).toHaveBeenCalledWith(
      "joao.silva@email.com"
    );

    expect(bcrypt.hash).toHaveBeenCalledWith("senha123", 10);

    expect(CreateUserRepository.createUser).toHaveBeenCalledWith({
      ...data,
      password: "hashedPassword",
    });

    expect(result).toEqual(mockUser);
  });

  it("não deve criar um usuário se o e-mail já estiver em uso", async () => {
    const existingUser = {
      id: "1",
      fullName: "Maria Souza",
      email: "maria.souza@email.com",
      password: "hashedPassword",
      Role: "USER" as Role,
      deletedAt: null,
    };

    (CreateUserRepository.findUserByEmail as jest.Mock).mockResolvedValue(
      existingUser
    );

    const data = {
      fullName: "Carlos Oliveira",
      email: "maria.souza@email.com",
      password: "senha123",
      Role: "USER" as Role,
    };

    await expect(CreateUserService.createUser(data)).rejects.toThrow(
      "E-mail já está em uso."
    );

    expect(CreateUserRepository.findUserByEmail).toHaveBeenCalledWith(
      "maria.souza@email.com"
    );

    expect(CreateUserRepository.createUser).not.toHaveBeenCalled();
  });

  it("deve atualizar o usuário com sucesso", async () => {
    const mockUpdatedUser = {
      id: "1",
      fullName: "João Silva",
      email: "joao.silva@email.com",
      password: "hashedPassword",
      Role: "USER",
      deletedAt: null,
    };

    const id = "1";
    const data = {
      fullName: "João Silva Atualizado",
      email: "joao.silva@email.com",
      password: "novaSenha123",
    };

    (UpdateUserRepository.updateUser as jest.Mock).mockResolvedValue(
      mockUpdatedUser
    );

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    const result = await UpdateUserService.updateUser(id, data);

    expect(bcrypt.hash).toHaveBeenCalledWith("novaSenha123", 10);
    expect(UpdateUserRepository.updateUser).toHaveBeenCalledWith(id, {
      ...data,
      password: "hashedPassword",
    });
    expect(result).toEqual(mockUpdatedUser);
  });

  it("deve deletar o usuário com sucesso", async () => {
    const id = "1";

    (deleteUserRepository.getUserId as jest.Mock).mockResolvedValue({ id });

    (deleteUserRepository.deleteUser as jest.Mock).mockResolvedValue(undefined);

    await deleteUserService.deleteUser(id);

    expect(deleteUserRepository.getUserId).toHaveBeenCalledWith(id);
    expect(deleteUserRepository.deleteUser).toHaveBeenCalledWith(id);
  });

  it("não deve deletar se o usuário não for encontrado", async () => {
    const id = "1";

    (deleteUserRepository.getUserId as jest.Mock).mockResolvedValue(null);

    await expect(deleteUserService.deleteUser(id)).rejects.toThrow(
      "Usuário não encontrado"
    );

    expect(deleteUserRepository.deleteUser).not.toHaveBeenCalled();
  });

  it("deve retornar o usuário com sucesso", async () => {
    const mockUser = {
      id: "1",
      fullName: "João Silva",
      email: "joao.silva@email.com",
      Role: "USER",
    };

    const id = "1";

    (GetUserByIdRepository.getById as jest.Mock).mockResolvedValue(mockUser);

    const result = await GetUserByIdService.execute({ id });

    expect(GetUserByIdRepository.getById).toHaveBeenCalledWith({ id });
    expect(result).toEqual(mockUser);
  });

  it("não deve retornar o usuário se o id não for encontrado", async () => {
    const id = "1";

    (GetUserByIdRepository.getById as jest.Mock).mockResolvedValue(null);

    const result = await GetUserByIdService.execute({ id });

    expect(GetUserByIdRepository.getById).toHaveBeenCalledWith({ id });
    expect(result).toBeNull();
  });
});

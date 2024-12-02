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

// Mock dos repositórios e bcrypt
jest.mock("../../modules/users/databases/createUserRepository");
jest.mock("../../modules/users/databases/updateUserRepository");
jest.mock("../../modules/users/databases/deleteUserRepository");
jest.mock("../../modules/users/databases/getIdUserRepository");
jest.mock("bcryptjs");

describe("User Services", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Testes para o CreateUserService
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

    // Mock para simular que o e-mail não existe
    (CreateUserRepository.findUserByEmail as jest.Mock).mockResolvedValue(null);

    // Mock para simular a criação do usuário
    (CreateUserRepository.createUser as jest.Mock).mockResolvedValue(mockUser);

    // Mock para o bcrypt.hash (simulando a criação da senha hash)
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    const result = await CreateUserService.createUser(data);

    // Verificar se o repositório foi chamado para buscar o usuário pelo email
    expect(CreateUserRepository.findUserByEmail).toHaveBeenCalledWith(
      "joao.silva@email.com"
    );

    // Verificar se o bcrypt.hash foi chamado para criptografar a senha
    expect(bcrypt.hash).toHaveBeenCalledWith("senha123", 10);

    // Verificar se o repositório foi chamado para criar o usuário com os dados corretos
    expect(CreateUserRepository.createUser).toHaveBeenCalledWith({
      ...data,
      password: "hashedPassword", // A senha deve estar hashada
    });

    // Verificar se o resultado é o usuário mockado
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

    // Mock para simular que o e-mail já está em uso
    (CreateUserRepository.findUserByEmail as jest.Mock).mockResolvedValue(
      existingUser
    );

    const data = {
      fullName: "Carlos Oliveira",
      email: "maria.souza@email.com",
      password: "senha123",
      Role: "USER" as Role,
    };

    // Verificar se um erro é lançado quando o e-mail já está em uso
    await expect(CreateUserService.createUser(data)).rejects.toThrow(
      "E-mail já está em uso."
    );

    // Verificar se a função `findUserByEmail` foi chamada
    expect(CreateUserRepository.findUserByEmail).toHaveBeenCalledWith(
      "maria.souza@email.com"
    );

    // A função `createUser` não deve ser chamada se o e-mail já estiver em uso
    expect(CreateUserRepository.createUser).not.toHaveBeenCalled();
  });

  // Testes para o UpdateUserService
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

    // Mock para simular que a atualização foi bem-sucedida
    (UpdateUserRepository.updateUser as jest.Mock).mockResolvedValue(
      mockUpdatedUser
    );

    // Mock para o bcrypt.hash (simulando a criação da senha hash)
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");

    const result = await UpdateUserService.updateUser(id, data);

    expect(bcrypt.hash).toHaveBeenCalledWith("novaSenha123", 10);
    expect(UpdateUserRepository.updateUser).toHaveBeenCalledWith(id, {
      ...data,
      password: "hashedPassword",
    });
    expect(result).toEqual(mockUpdatedUser);
  });

  // Testes para o DeleteUserService
  it("deve deletar o usuário com sucesso", async () => {
    const id = "1";

    // Mock para simular que o usuário existe
    (deleteUserRepository.getUserId as jest.Mock).mockResolvedValue({ id });

    // Mock para simular que a exclusão foi bem-sucedida
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

  // Testes para o GetUserByIdService
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

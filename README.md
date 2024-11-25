## 🚗 CompassCar API 2.0

API para o gerenciamento de pedidos, clientes e carros em um sistema de vendas de veículos. Ele utiliza Node.js com TypeScript, Prisma como ORM para o banco de dados MySQL, e validação de dados com o Joi.

## 💻 Como executar o projeto localmente ⬇️

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v14 ou superior)
- [MySQL](https://www.mysql.com/) (Caso não vá utilizar o Docker)

1 - Clone o projeto

```bash
  git clone git@github.com:gabriel-am12/AWS_NODE_SET24_DESAFIO_02_Sons-of-Node.git
```

2 - Vá até o diretório

```bash
  cd .\AWS_NODE_SET24_DESAFIO_02_Sons-of-Node\
```

3 - Instale as dependências

```bash
  npm install
```

4 - Configure seu banco de dados no arquivo .env, por exemplo:

```bash
  DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/DB_NAME"
  JWT_SECRET="seu_token_secreto"
```

5 - Execute as migrações e crie o cliente do Prisma

```bash
  npx prisma migrate dev
  npx prisma generate
```

6 - Execute as seeds para popular o B.D (opcional)

```bash
  npm run seed
```

7 - Inicie o servidor

```bash
  npm run dev
```

Executar testes

```bash
  npm run test
```

Executar Lint

```bash
  npm run lint
```

## 🔢 Documentação da API

A documentação da API está disponível através do Swagger UI. Quando estiver rodando o projeto, você pode acessá-la em [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

![Swagger UI](assets/swagger_print.png)

## 🗃️ Tabelas do B.D

![compassCarV2DBDiagram](assets/compassCarV2DBDiagram.png)

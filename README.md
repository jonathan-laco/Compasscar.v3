## 🚗 CompassCar API 3.0

API para gerenciamento de pedidos, clientes e veículos em um sistema de vendas de automóveis. Utiliza Node.js com TypeScript, Prisma como ORM para o banco de dados PostgreSQL, e validação de dados com Joi.

## 💻 EXECUTANDO PROJETO EM CLOUD E LOCALMENTE ⬇️

### Pré-requisitos

- [Node.js](https://nodejs.org/)
- [Postgresql](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)

1 - Clone o projeto

```bash
  git clone https://github.com/jonathan-laco/CompassCar.v3.git
```

2 - Vá até o diretório

```bash
  cd  CompassCar.v3
```

3 - Instale as dependências

```bash
  npm install
```

4 - Configure seu banco de dados no arquivo .env, por exemplo:

```bash
  DATABASE_URL="postgresql://admin:root@localhost:5432/compasscar"
  JWT_SECRET="seu_token_secreto"
```

5 - Baixe a imagem do Postgresql com este comando

```bash
  docker-compose up -d
```

5 - Execute as migrações e crie o cliente do Prisma

```bash
  npx prisma migrate dev
  npx prisma generate
```

6 - Execute as seeds para popular a database

```bash
  npm run seed
```

7 - Faça o build da aplicação

```bash
  npm run build
```

7 - Execute a aplicação com:

```bash
  npm start
```

Executar testes use o comando

```bash
  npm run test
```

os testes já estão definidos para --coverage, exibindo a cobertura de testes feitos no projeto

## 🔢 Documentação da API

## 🌐 Ambiente de Produção

A documentação da API está apontada para o DNS público, garantindo que as informações estejam sempre atualizadas e acessíveis. Utilize os links abaixo para acessar a documentação:

- **URLs de acesso**:
  - [API Docs DNS](http://ec2-13-58-172-229.us-east-2.compute.amazonaws.com:8080/api-docs)

## 🛠️ Desafios Enfrentados

### 1. Criação de Testes

No início, compreender a lógica dos testes unitários foi desafiador, especialmente ao trabalhar com mocks e estruturas de teste. No entanto, com o tempo, a prática se tornou mais natural e trouxe um ganho significativo para a qualidade do código.

### 2. Exposição da API

Entender o processo de deploy e expor a API para acesso externo foi uma experiência enriquecedora. Esse desafio trouxe muitos aprendizados, desde a configuração do ambiente até a utilização de DNS público e gerenciamento de variáveis de ambiente.

### 3. Utilização do Docker

A utilização do Docker foi um fator essencial para garantir uma aplicação mais segura, estável e com ambiente padronizado. Apesar de apresentar uma curva inicial de aprendizado, tornou-se uma ferramenta indispensável no processo de desenvolvimento e deploy.

### 4. Reflexão Geral

O desenvolvimento deste projeto apresentou desafios diversos que contribuíram para o aprendizado e evolução no uso de boas práticas em backend, integração de sistemas e automação de ambientes.

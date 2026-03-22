# REST vs GraphQL: Architectural Comparison Demo

Este projeto é uma demonstração prática e interativa das diferenças arquiteturais, de performance e de experiência de desenvolvimento entre **REST API** e **GraphQL**. O objetivo é ilustrar conceitos como o problema do N+1, Round-trips de rede e Over-fetching.
    
## 🚀 Tecnologias Utilizadas

- **Backend:** Node.js com [Fastify](https://www.fastify.io/) (Alta performance).
- **GraphQL:** [Mercurius](https://mercurius.dev/) + [DataLoader](https://github.com/graphql/dataloader) (Otimização de queries).
- **ORM:** [Prisma](https://www.prisma.io/) (Type-safe database access).
- **Frontend:** React 19 + Tailwind CSS + Lucide Icons.
- **Arquitetura:** Clean Architecture (Separação de responsabilidades).

---

## 🏗️ Estrutura de Pastas e Arquivos

Abaixo, o diagrama da estrutura do projeto seguindo os princípios da **Clean Architecture**:

```text
├── prisma/
│   └── schema.prisma          # Definição do banco de dados (SQLite)
├── src/
│   ├── application/           # Camada de Aplicação (Regras de Negócio)
│   │   └── use-cases/         # Casos de uso (CreateUser, ListOrders, etc.)
│   ├── domain/                # Camada de Domínio (Coração do App)
│   │   └── entities/          # Modelos de dados puros (User, Order)
│   ├── infra/                 # Camada de Infraestrutura (Implementações)
│   │   └── repositories/      # Acesso ao banco via Prisma
│   ├── presentation/          # Camada de Interface (Exposição de Dados)
│   │   ├── graphql/           # Implementação GraphQL (Schema, Resolvers, Loaders)
│   │   └── rest/              # Implementação REST (Rotas Fastify)
│   ├── App.tsx                # Frontend React (Dashboard de comparação)
│   └── main.tsx               # Ponto de entrada do Frontend
├── server.ts                  # Servidor Backend (Fastify + Vite Middleware)
└── package.json               # Dependências e scripts do projeto
```

---

## 💡 Conceitos Demonstrados

### 1. O Problema do N+1 (REST)
No modo REST, para listar usuários e seus respectivos pedidos, o cliente faz:
1.  **1 Chamada** para buscar a lista de usuários (`GET /api/users`).
2.  **N Chamadas** (uma para cada usuário) para buscar os pedidos (`GET /api/orders?userId=...`).
*Isso gera um overhead de rede massivo e latência acumulada.*

### 2. Agregação no Servidor (GraphQL)
No GraphQL, o cliente envia uma única Query descrevendo exatamente o que precisa. O servidor resolve toda a árvore de dados em uma **única requisição HTTP**.

### 3. DataLoaders (Otimização)
Para evitar que o banco de dados sofra com o N+1 internamente, utilizamos **DataLoaders**. Eles agrupam as IDs de pedidos e fazem uma única consulta `IN` no banco de dados, garantindo performance máxima.

### 4. Latência Sintética
Injetamos latência artificial nos endpoints REST para simular condições reais de rede e tornar a comparação visual no "Network Waterfall" mais evidente.

---

## 🛠️ Ferramentas de Exploração

Para facilitar o teste e a compreensão das APIs, o projeto inclui interfaces interativas:

- **Swagger UI (REST):** Acesse `/api/docs` para visualizar a documentação OpenAPI 3.0, testar os endpoints e ver os schemas de dados.
- **GraphiQL (GraphQL):** Acesse `/graphiql` para explorar o schema GraphQL, ler a documentação gerada automaticamente e executar queries em tempo real.

---

## 🔍 Exemplo de Consulta GraphQL

Diferente do REST, onde você precisaria de múltiplas chamadas, no GraphQL você pode obter usuários e seus pedidos em uma única requisição:

```graphql
query GetUsersWithOrders {
  users {
    id
    name
    email
    orders {
      id
      status
      totalValue
    }
  }
}
```

---

## 🛠️ Como Executar

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Prepare o banco de dados:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Acesse a aplicação:**
    Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📊 Como Usar a Demo

1.  Clique no botão **"Seed Data"** para popular o banco com dados realistas.
2.  Selecione **REST API** e clique em **"Fetch Data"**. Observe as múltiplas barras no log de rede (Waterfall).
3.  Selecione **GraphQL** e clique em **"Fetch Data"**. Observe a requisição única e a velocidade superior.
4.  Use os botões **Swagger** e **GraphiQL** no topo da tela para explorar as APIs de forma técnica e interativa.
5.  Analise os logs laterais para ver o tempo total de execução e o número de requisições disparadas.

---

## 🐳 Docker Setup

Para rodar a aplicação usando Docker:

1.  **Construa e inicie os containers:**
    ```bash
    docker-compose up --build
    ```

2.  **Acesse a aplicação:**
    Abra [http://localhost:3000](http://localhost:3000).

A base de dados SQLite será persistida no volume `app-data` definido no `docker-compose.yml`.

---

Desenvolvido para fins educacionais sobre arquitetura de sistemas distribuídos.

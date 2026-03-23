# REST vs GraphQL: Architectural Comparison Demo

This project is a practical and interactive demonstration of the architectural, performance, and development experience differences between **REST API** and **GraphQL**. The goal is to illustrate concepts such as the N+1 problem, network round-trips, and over-fetching.

## 🚀 Technologies Used

- **Backend:** Node.js with [Fastify](https://www.fastify.io/) (High performance).
- **GraphQL:** [Mercurius](https://mercurius.dev/) + [DataLoader](https://github.com/graphql/dataloader) (Query optimization).
- **ORM:** [Prisma](https://www.prisma.io/) (Type-safe database access).
- **Frontend:** React 19 + Tailwind CSS + Lucide Icons.
- **Architecture:** Clean Architecture (Separation of concerns).

---

## 🏗️ Folder and File Structure

Below is the project structure diagram following **Clean Architecture** principles:

```text
├── prisma/
│   └── schema.prisma          # Database definition (SQLite)
├── src/
│   ├── application/           # Application Layer (Business Rules)
│   │   └── use-cases/         # Use cases (CreateUser, ListOrders, etc.)
│   ├── domain/                # Domain Layer (Core of the App)
│   │   └── entities/          # Pure data models (User, Order)
│   ├── infra/                 # Infrastructure Layer (Implementations)
│   │   └── repositories/      # Database access via Prisma
│   ├── presentation/          # Presentation Layer (Data Exposure)
│   │   ├── graphql/           # GraphQL implementation (Schema, Resolvers, Loaders)
│   │   └── rest/              # REST implementation (Fastify routes)
│   ├── App.tsx                # React Frontend (Comparison Dashboard)
│   └── main.tsx               # Frontend entry point
├── server.ts                  # Backend Server (Fastify + Vite Middleware)
└── package.json               # Project dependencies and scripts
```

---

## 💡 Concepts Demonstrated

### 1. The N+1 Problem (REST)
In REST mode, to list users and their respective orders, the client does:
1.  **1 Call** to fetch the user list (`GET /api/users`).
2.  **N Calls** (one for each user) to fetch the orders (`GET /api/orders?userId=...`).
*This generates massive network overhead and accumulated latency.*

### 2. Server-side Aggregation (GraphQL)
In GraphQL, the client sends a single Query describing exactly what it needs. The server resolves the entire data tree in a **single HTTP request**.

### 3. DataLoaders (Optimization)
To prevent the database from suffering from N+1 internally, we use **DataLoaders**. They batch order IDs and perform a single `IN` query on the database, ensuring maximum performance.

### 4. Synthetic Latency
We inject artificial latency into REST endpoints to simulate real network conditions and make the visual comparison in the "Network Waterfall" more evident.

---

## 🛠️ Exploration Tools

To facilitate testing and understanding the APIs, the project includes interactive interfaces:

- **Swagger UI (REST):** Access `/api/docs` to view OpenAPI 3.0 documentation, test endpoints, and see data schemas.
- **GraphiQL (GraphQL):** Access `/graphiql` to explore the GraphQL schema, read automatically generated documentation, and execute queries in real-time.

---

## 🔍 GraphQL Query Example

Unlike REST, where you would need multiple calls, in GraphQL you can get users and their orders in a single request:

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

## 🛠️ How to Run

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Prepare the database:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Access the application:**
    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 How to Use the Demo

1.  Click the **"Seed Data"** button to populate the database with realistic data.
2.  Select **REST API** and click **"Fetch Data"**. Observe the multiple bars in the network log (Waterfall).
3.  Select **GraphQL** and click **"Fetch Data"**. Observe the single request and superior speed.
4.  Use the **Swagger** and **GraphiQL** buttons at the top of the screen to explore the APIs technically and interactively.
5.  Analyze the side logs to see the total execution time and the number of requests triggered.

---

## 🐳 Docker Setup

To run the application using Docker:

1.  **Build and start the containers:**
    ```bash
    docker-compose up --build
    ```

2.  **Access the application:**
    Open [http://localhost:3000](http://localhost:3000).

The SQLite database will be persisted in the `app-data` volume defined in `docker-compose.yml`.

---

## GitHub Actions to Docker Hub

The repository now includes a workflow at `.github/workflows/dockerhub.yml`.

It does the following:

```text
- Pull request to main/master: builds the Docker image to validate the Dockerfile, but does not push.
- Push to main/master: builds the image and pushes it to Docker Hub.
- Git tag starting with v: builds the image and pushes it to Docker Hub.
- Manual trigger: can be started from the GitHub Actions tab.
```

Configure these repository secrets before running the workflow:

```text
DOCKER_USERNAME
DOCKERHUB_TOKEN
DOCKER_PASSWORD
```

`DOCKERHUB_TOKEN` is preferred. `DOCKER_PASSWORD` is accepted as a fallback when no token is configured.

Optional repository variable:

```text
DOCKERHUB_REPOSITORY
```

If `DOCKERHUB_REPOSITORY` is not defined, the workflow uses the GitHub repository name as the Docker Hub repository name.

---

Developed for educational purposes on distributed systems architecture.



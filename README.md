# REST vs GraphQL: Architectural Comparison Demo

This project is a practical and interactive demonstration of the architectural, performance, and developer experience differences between **REST API** and **GraphQL**. The goal is to illustrate concepts such as the N+1 problem, network round-trips, and over-fetching.
    
## 🚀 Technologies Used

- **Backend:** Node.js with [Fastify](https://www.fastify.io/) (high performance).
- **GraphQL:** [Mercurius](https://mercurius.dev/) + [DataLoader](https://github.com/graphql/dataloader) (query optimization).
- **ORM:** [Prisma](https://www.prisma.io/) (type-safe database access).
- **Frontend:** React 19 + Tailwind CSS + Lucide Icons.
- **Architecture:** Clean Architecture (separation of concerns).

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
│   ├── presentation/          # Interface Layer (Data Exposure)
│   │   ├── graphql/           # GraphQL implementation (Schema, Resolvers, Loaders)
│   │   └── rest/              # REST implementation (Fastify routes)
│   ├── App.tsx                # React Frontend (comparison dashboard)
│   └── main.tsx               # Frontend entry point
├── server.ts                  # Backend server (Fastify + Vite middleware)
└── package.json               # Project dependencies and scripts

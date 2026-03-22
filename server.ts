import fastify from "fastify";
import mercurius from "mercurius";
import { PrismaClient } from "@prisma/client";
import { typeDefs } from "./src/presentation/graphql/schema/index.js";
import { resolvers } from "./src/presentation/graphql/resolvers/index.js";
import { createLoaders } from "./src/presentation/graphql/loaders/index.js";
import { userRoutes } from "./src/presentation/rest/routes/user-routes.js";
import { orderRoutes } from "./src/presentation/rest/routes/order-routes.js";
import { orderDetailRoutes } from "./src/presentation/rest/routes/order-detail-routes.js";
import { seedRoutes } from "./src/presentation/rest/routes/seed-routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

async function start() {
  // Register Swagger
  await server.register(import("@fastify/swagger"), {
    swagger: {
      info: {
        title: "REST vs GraphQL Demo API",
        description: "API documentation for the REST vs GraphQL comparison project",
        version: "1.0.0",
      },
      host: "localhost:3000",
      schemes: ["http"],
      consumes: ["application/json"],
      produces: ["application/json"],
    },
  });

  await server.register(import("@fastify/swagger-ui"), {
    routePrefix: "/api/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  // Register GraphQL
  server.register(mercurius, {
    schema: typeDefs,
    resolvers,
    context: () => {
      return {
        prisma,
        loaders: createLoaders(prisma),
      };
    },
    graphiql: true,
  });

  // Register REST Routes
  server.register(async (instance) => {
    userRoutes(instance, prisma);
    orderRoutes(instance, prisma);
    orderDetailRoutes(instance, prisma);
    seedRoutes(instance, prisma);
  }, { prefix: "/api" });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Fastify middleware integration for Vite
    server.addHook('onRequest', async (request, reply) => {
      // Skip Vite for API, GraphQL and Swagger routes
      if (
        request.url.startsWith('/api') || 
        request.url.startsWith('/graphql') || 
        request.url.startsWith('/graphiql')
      ) {
        return;
      }

      const next = () => new Promise((resolve) => {
        vite.middlewares(request.raw, reply.raw, () => {
          resolve(null);
        });
      });
      await next();
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    server.register(import('@fastify/static'), {
      root: distPath,
      prefix: '/',
    });
    server.setNotFoundHandler((request, reply) => {
      reply.sendFile('index.html');
    });
  }

  const PORT = 3000;
  try {
    await server.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GraphQL at http://localhost:${PORT}/graphql`);
    console.log(`GraphiQL at http://localhost:${PORT}/graphiql`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

import { FastifyInstance } from "fastify";
import { CreateUserUseCase, ListUsersUseCase, GetUserByIdUseCase } from "../../../application/use-cases/user-use-cases";
import { PrismaUserRepository } from "../../../infra/repositories/prisma-repositories";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

export async function userRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  const userRepository = new PrismaUserRepository(prisma);
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const listUsersUseCase = new ListUsersUseCase(userRepository);
  const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);

  fastify.post("/users", {
    schema: {
      description: 'Create a new user',
      tags: ['Users'],
      body: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        201: {
          description: 'Successful response',
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().optional(),
    });

    const data = schema.parse(request.body);
    const user = await createUserUseCase.execute(data);
    return reply.status(201).send(user);
  });

  fastify.get("/users", {
    schema: {
      description: 'List all users',
      tags: ['Users'],
      response: {
        200: {
          description: 'Successful response',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  }, async () => {
    // Simulate network/database latency for classic REST
    await new Promise(resolve => setTimeout(resolve, 300));
    return listUsersUseCase.execute();
  });

  fastify.get("/users/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const user = await getUserByIdUseCase.execute(id);
    if (!user) return reply.status(404).send({ message: "User not found" });
    return user;
  });
}

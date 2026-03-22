import { FastifyInstance } from "fastify";
import { CreateOrderUseCase, ListOrdersUseCase, GetOrderByIdUseCase } from "../../../application/use-cases/order-use-cases";
import { PrismaOrderRepository } from "../../../infra/repositories/prisma-repositories";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

export async function orderRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  const orderRepository = new PrismaOrderRepository(prisma);
  const createOrderUseCase = new CreateOrderUseCase(orderRepository);
  const listOrdersUseCase = new ListOrdersUseCase(orderRepository);
  const getOrderByIdUseCase = new GetOrderByIdUseCase(orderRepository);

  fastify.post("/orders", {
    schema: {
      description: 'Create a new order',
      tags: ['Orders'],
      body: {
        type: 'object',
        required: ['userId', 'status', 'totalValue'],
        properties: {
          userId: { type: 'string' },
          status: { type: 'string' },
          totalValue: { type: 'number' }
        }
      },
      response: {
        201: {
          description: 'Successful response',
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            status: { type: 'string' },
            totalValue: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const schema = z.object({
      userId: z.string(),
      status: z.string(),
      totalValue: z.number(),
    });

    const data = schema.parse(request.body);
    const order = await createOrderUseCase.execute(data);
    return reply.status(201).send(order);
  });

  fastify.get("/orders", {
    schema: {
      description: 'List all orders',
      tags: ['Orders'],
      response: {
        200: {
          description: 'Successful response',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              status: { type: 'string' },
              totalValue: { type: 'number' }
            }
          }
        }
      }
    }
  }, async () => {
    // Simulate network/database latency for classic REST
    await new Promise(resolve => setTimeout(resolve, 200));
    return listOrdersUseCase.execute();
  });

  fastify.get("/orders/:id", async (request, reply) => {
    const { id } = z.object({ id: z.string() }).parse(request.params);
    const order = await getOrderByIdUseCase.execute(id);
    if (!order) return reply.status(404).send({ message: "Order not found" });
    return order;
  });
}

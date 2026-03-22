import { FastifyInstance } from "fastify";
import { CreateOrderDetailUseCase, ListOrderDetailsUseCase } from "../../../application/use-cases/order-detail-use-cases";
import { PrismaOrderDetailRepository } from "../../../infra/repositories/prisma-repositories";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

export async function orderDetailRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  const detailRepository = new PrismaOrderDetailRepository(prisma);
  const createOrderDetailUseCase = new CreateOrderDetailUseCase(detailRepository);
  const listOrderDetailsUseCase = new ListOrderDetailsUseCase(detailRepository);

  fastify.post("/order-details", async (request, reply) => {
    const schema = z.object({
      orderId: z.string(),
      productName: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
    });

    const data = schema.parse(request.body);
    const detail = await createOrderDetailUseCase.execute(data);
    return reply.status(201).send(detail);
  });

  fastify.get("/orders/:orderId/details", async (request) => {
    const { orderId } = z.object({ orderId: z.string() }).parse(request.params);
    // Simulate network/database latency for classic REST
    await new Promise(resolve => setTimeout(resolve, 150));
    return listOrderDetailsUseCase.execute(orderId);
  });
}

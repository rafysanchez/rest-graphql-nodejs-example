import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import { CreateUserUseCase } from "../../../application/use-cases/user-use-cases.js";
import { CreateOrderUseCase } from "../../../application/use-cases/order-use-cases.js";
import { CreateOrderDetailUseCase } from "../../../application/use-cases/order-detail-use-cases.js";
import { PrismaUserRepository, PrismaOrderRepository, PrismaOrderDetailRepository } from "../../../infra/repositories/prisma-repositories.js";

export async function seedRoutes(fastify: FastifyInstance, prisma: PrismaClient) {
  const userRepo = new PrismaUserRepository(prisma);
  const orderRepo = new PrismaOrderRepository(prisma);
  const detailRepo = new PrismaOrderDetailRepository(prisma);

  const createUser = new CreateUserUseCase(userRepo);
  const createOrder = new CreateOrderUseCase(orderRepo);
  const createDetail = new CreateOrderDetailUseCase(detailRepo);

  fastify.post("/seed", async (request, reply) => {
    try {
      // Clean existing data
      await prisma.orderDetail.deleteMany();
      await prisma.order.deleteMany();
      await prisma.user.deleteMany();

      const mockUsers = [
        { name: "Rafael Sanchez", email: "rafysanchez@gmail.com" },
        { name: "Ana Silva", email: "ana.silva@example.com" },
        { name: "Bruno Oliveira", email: "bruno.oliveira@example.com" },
        { name: "Carla Santos", email: "carla.santos@example.com" },
      ];

      const products = [
        { name: "MacBook Pro M3", price: 2499.99 },
        { name: "iPhone 15 Pro", price: 999.99 },
        { name: "AirPods Pro 2", price: 249.00 },
        { name: "Monitor Dell 4K", price: 599.00 },
        { name: "Teclado Keychron K2", price: 89.00 },
        { name: "Mouse Logitech MX Master 3S", price: 99.00 },
      ];

      for (const userData of mockUsers) {
        const user = await createUser.execute({ ...userData, password: "password123" });
        
        // Create 1-3 orders per user
        const numOrders = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numOrders; i++) {
          const status = ["PENDING", "COMPLETED", "SHIPPED", "CANCELLED"][Math.floor(Math.random() * 4)];
          
          // Temporary total, will be updated by details
          const order = await createOrder.execute({
            userId: user.id,
            status,
            totalValue: 0
          });

          // Create 1-4 details per order
          const numDetails = Math.floor(Math.random() * 4) + 1;
          let orderTotal = 0;
          
          for (let j = 0; j < numDetails; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            
            const detail = await createDetail.execute({
              orderId: order.id,
              productName: product.name,
              quantity,
              unitPrice: product.price
            });
            
            orderTotal += detail.subtotal;
          }

          // Update order total
          await prisma.order.update({
            where: { id: order.id },
            data: { totalValue: orderTotal }
          });
        }
      }

      return { message: "Database seeded successfully with realistic data!" };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: "Failed to seed database" });
    }
  });
}

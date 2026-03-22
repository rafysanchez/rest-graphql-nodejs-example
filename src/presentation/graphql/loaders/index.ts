import DataLoader from "dataloader";
import { PrismaClient } from "@prisma/client";

export function createLoaders(prisma: PrismaClient) {
  return {
    // Loader for orders by user ID (N+1 solution)
    ordersByUserLoader: new DataLoader(async (userIds: readonly string[]) => {
      const orders = await prisma.order.findMany({
        where: { userId: { in: [...userIds] } },
      });
      
      return userIds.map(id => orders.filter(o => o.userId === id));
    }),

    // Loader for user by ID
    userLoader: new DataLoader(async (userIds: readonly string[]) => {
      const users = await prisma.user.findMany({
        where: { id: { in: [...userIds] } },
      });
      
      const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, any>);

      return userIds.map(id => userMap[id]);
    }),

    // Loader for order details by order ID
    detailsByOrderLoader: new DataLoader(async (orderIds: readonly string[]) => {
      const details = await prisma.orderDetail.findMany({
        where: { orderId: { in: [...orderIds] } },
      });
      
      return orderIds.map(id => details.filter(d => d.orderId === id));
    }),
  };
}

import { PrismaClient } from "@prisma/client";
import { CreateUserUseCase, ListUsersUseCase, GetUserByIdUseCase } from "../../../application/use-cases/user-use-cases";
import { CreateOrderUseCase, ListOrdersUseCase, GetOrderByIdUseCase } from "../../../application/use-cases/order-use-cases";
import { PrismaUserRepository, PrismaOrderRepository } from "../../../infra/repositories/prisma-repositories";

export const resolvers = {
  Query: {
    users: async (_: any, __: any, { prisma }: any) => {
      const repo = new PrismaUserRepository(prisma);
      return new ListUsersUseCase(repo).execute();
    },
    user: async (_: any, { id }: { id: string }, { prisma }: any) => {
      const repo = new PrismaUserRepository(prisma);
      return new GetUserByIdUseCase(repo).execute(id);
    },
    orders: async (_: any, __: any, { prisma }: any) => {
      const repo = new PrismaOrderRepository(prisma);
      return new ListOrdersUseCase(repo).execute();
    },
    order: async (_: any, { id }: { id: string }, { prisma }: any) => {
      const repo = new PrismaOrderRepository(prisma);
      return new GetOrderByIdUseCase(repo).execute(id);
    },
  },
  Mutation: {
    createUser: async (_: any, args: any, { prisma }: any) => {
      const repo = new PrismaUserRepository(prisma);
      return new CreateUserUseCase(repo).execute(args);
    },
    createOrder: async (_: any, args: any, { prisma }: any) => {
      const repo = new PrismaOrderRepository(prisma);
      return new CreateOrderUseCase(repo).execute(args);
    },
  },
  User: {
    orders: async (parent: any, _: any, { loaders }: any) => {
      return loaders.ordersByUserLoader.load(parent.id);
    },
  },
  Order: {
    user: async (parent: any, _: any, { loaders }: any) => {
      return loaders.userLoader.load(parent.userId);
    },
    details: async (parent: any, _: any, { loaders }: any) => {
      return loaders.detailsByOrderLoader.load(parent.id);
    },
  },
};

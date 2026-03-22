import { PrismaClient } from "@prisma/client";
import { IUserRepository, IOrderRepository, IOrderDetailRepository } from "../../domain/repositories";
import { User, Order, OrderDetail } from "../../domain/entities";

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password || "",
      },
    });
    return new User(created.id, created.name, created.email, created.password, created.createdAt, created.updatedAt);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return new User(user.id, user.name, user.email, user.password, user.createdAt, user.updatedAt);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new User(user.id, user.name, user.email, user.password, user.createdAt, user.updatedAt);
  }

  async list(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users.map(u => new User(u.id, u.name, u.email, u.password, u.createdAt, u.updatedAt));
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { name: user.name, email: user.email },
    });
    return new User(updated.id, updated.name, updated.email, updated.password, updated.createdAt, updated.updatedAt);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async create(order: Order): Promise<Order> {
    const created = await this.prisma.order.create({
      data: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalValue: order.totalValue,
      },
    });
    return new Order(created.id, created.userId, created.status, created.totalValue, created.createdAt, created.updatedAt);
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) return null;
    return new Order(order.id, order.userId, order.status, order.totalValue, order.createdAt, order.updatedAt);
  }

  async listByUserId(userId: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({ where: { userId } });
    return orders.map(o => new Order(o.id, o.userId, o.status, o.totalValue, o.createdAt, o.updatedAt));
  }

  async list(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany();
    return orders.map(o => new Order(o.id, o.userId, o.status, o.totalValue, o.createdAt, o.updatedAt));
  }

  async update(order: Order): Promise<Order> {
    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: order.status, totalValue: order.totalValue },
    });
    return new Order(updated.id, updated.userId, updated.status, updated.totalValue, updated.createdAt, updated.updatedAt);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }
}

export class PrismaOrderDetailRepository implements IOrderDetailRepository {
  constructor(private prisma: PrismaClient) {}

  async create(detail: OrderDetail): Promise<OrderDetail> {
    const created = await this.prisma.orderDetail.create({
      data: {
        id: detail.id,
        orderId: detail.orderId,
        productName: detail.productName,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal,
      },
    });
    return new OrderDetail(created.id, created.orderId, created.productName, created.quantity, created.unitPrice, created.subtotal, created.createdAt, created.updatedAt);
  }

  async listByOrderId(orderId: string): Promise<OrderDetail[]> {
    const details = await this.prisma.orderDetail.findMany({ where: { orderId } });
    return details.map(d => new OrderDetail(d.id, d.orderId, d.productName, d.quantity, d.unitPrice, d.subtotal, d.createdAt, d.updatedAt));
  }

  async findById(id: string): Promise<OrderDetail | null> {
    const detail = await this.prisma.orderDetail.findUnique({ where: { id } });
    if (!detail) return null;
    return new OrderDetail(detail.id, detail.orderId, detail.productName, detail.quantity, detail.unitPrice, detail.subtotal, detail.createdAt, detail.updatedAt);
  }

  async update(detail: OrderDetail): Promise<OrderDetail> {
    const updated = await this.prisma.orderDetail.update({
      where: { id: detail.id },
      data: { productName: detail.productName, quantity: detail.quantity, unitPrice: detail.unitPrice, subtotal: detail.subtotal },
    });
    return new OrderDetail(updated.id, updated.orderId, updated.productName, updated.quantity, updated.unitPrice, updated.subtotal, updated.createdAt, updated.updatedAt);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orderDetail.delete({ where: { id } });
  }
}

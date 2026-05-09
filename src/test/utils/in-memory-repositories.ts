import { User, Order, OrderDetail } from "../../domain/entities";
import {
  IUserRepository,
  IOrderRepository,
  IOrderDetailRepository,
} from "../../domain/repositories";

export class InMemoryUserRepository implements IUserRepository {
  constructor(private items: User[] = []) {}

  async create(user: User): Promise<User> {
    this.items.push(user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.items.find((user) => user.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((user) => user.email === email) ?? null;
  }

  async list(): Promise<User[]> {
    return [...this.items];
  }

  async update(user: User): Promise<User> {
    const index = this.items.findIndex((item) => item.id === user.id);
    this.items[index] = user;
    return user;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((user) => user.id !== id);
  }
}

export class InMemoryOrderRepository implements IOrderRepository {
  constructor(private items: Order[] = []) {}

  async create(order: Order): Promise<Order> {
    this.items.push(order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.items.find((order) => order.id === id) ?? null;
  }

  async listByUserId(userId: string): Promise<Order[]> {
    return this.items.filter((order) => order.userId === userId);
  }

  async list(): Promise<Order[]> {
    return [...this.items];
  }

  async update(order: Order): Promise<Order> {
    const index = this.items.findIndex((item) => item.id === order.id);
    this.items[index] = order;
    return order;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((order) => order.id !== id);
  }
}

export class InMemoryOrderDetailRepository implements IOrderDetailRepository {
  constructor(private items: OrderDetail[] = []) {}

  async create(detail: OrderDetail): Promise<OrderDetail> {
    this.items.push(detail);
    return detail;
  }

  async listByOrderId(orderId: string): Promise<OrderDetail[]> {
    return this.items.filter((detail) => detail.orderId === orderId);
  }

  async findById(id: string): Promise<OrderDetail | null> {
    return this.items.find((detail) => detail.id === id) ?? null;
  }

  async update(detail: OrderDetail): Promise<OrderDetail> {
    const index = this.items.findIndex((item) => item.id === detail.id);
    this.items[index] = detail;
    return detail;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((detail) => detail.id !== id);
  }
}

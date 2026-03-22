import { User, Order, OrderDetail } from "../entities";

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(): Promise<User[]>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface IOrderRepository {
  create(order: Order): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  listByUserId(userId: string): Promise<Order[]>;
  list(): Promise<Order[]>;
  update(order: Order): Promise<Order>;
  delete(id: string): Promise<void>;
}

export interface IOrderDetailRepository {
  create(detail: OrderDetail): Promise<OrderDetail>;
  listByOrderId(orderId: string): Promise<OrderDetail[]>;
  findById(id: string): Promise<OrderDetail | null>;
  update(detail: OrderDetail): Promise<OrderDetail>;
  delete(id: string): Promise<void>;
}

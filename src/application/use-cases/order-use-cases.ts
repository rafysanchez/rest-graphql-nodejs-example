import { IOrderRepository, IOrderDetailRepository } from "../../domain/repositories";
import { Order, OrderDetail } from "../../domain/entities";

export interface CreateOrderDTO {
  userId: string;
  status: string;
  totalValue: number;
}

export class CreateOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(data: CreateOrderDTO): Promise<Order> {
    const order = new Order(
      globalThis.crypto.randomUUID(),
      data.userId,
      data.status,
      data.totalValue
    );
    return this.orderRepository.create(order);
  }
}

export class ListOrdersUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(): Promise<Order[]> {
    return this.orderRepository.list();
  }
}

export class GetOrderByIdUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }
}

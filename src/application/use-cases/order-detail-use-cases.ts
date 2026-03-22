import { IOrderDetailRepository } from "../../domain/repositories";
import { OrderDetail } from "../../domain/entities";

export interface CreateOrderDetailDTO {
  orderId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export class CreateOrderDetailUseCase {
  constructor(private detailRepository: IOrderDetailRepository) {}

  async execute(data: CreateOrderDetailDTO): Promise<OrderDetail> {
    const subtotal = data.quantity * data.unitPrice;
    const detail = new OrderDetail(
      globalThis.crypto.randomUUID(),
      data.orderId,
      data.productName,
      data.quantity,
      data.unitPrice,
      subtotal
    );
    return this.detailRepository.create(detail);
  }
}

export class ListOrderDetailsUseCase {
  constructor(private detailRepository: IOrderDetailRepository) {}

  async execute(orderId: string): Promise<OrderDetail[]> {
    return this.detailRepository.listByOrderId(orderId);
  }
}

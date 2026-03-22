export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public password?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}

export class Order {
  constructor(
    public readonly id: string,
    public userId: string,
    public status: string,
    public totalValue: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}

export class OrderDetail {
  constructor(
    public readonly id: string,
    public orderId: string,
    public productName: string,
    public quantity: number,
    public unitPrice: number,
    public subtotal: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}

import test from "node:test";
import assert from "node:assert/strict";

import { User, OrderDetail } from "../../domain/entities";
import {
  CreateUserUseCase,
  ListUsersUseCase,
  GetUserByIdUseCase,
} from "./user-use-cases";
import {
  CreateOrderUseCase,
  ListOrdersUseCase,
  GetOrderByIdUseCase,
} from "./order-use-cases";
import {
  CreateOrderDetailUseCase,
  ListOrderDetailsUseCase,
} from "./order-detail-use-cases";
import {
  InMemoryUserRepository,
  InMemoryOrderRepository,
  InMemoryOrderDetailRepository,
} from "../../test/utils/in-memory-repositories";

test("CreateUserUseCase cria um usuario quando o email ainda nao existe", async () => {
  const userRepository = new InMemoryUserRepository();
  const useCase = new CreateUserUseCase(userRepository);

  const user = await useCase.execute({
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "123456",
  });

  assert.equal(user.name, "Ada Lovelace");
  assert.equal(user.email, "ada@example.com");
  assert.equal(user.password, "123456");
  assert.ok(user.id);
});

test("CreateUserUseCase impede criacao de email duplicado", async () => {
  const existingUser = new User("user-1", "Ada Lovelace", "ada@example.com");
  const userRepository = new InMemoryUserRepository([existingUser]);
  const useCase = new CreateUserUseCase(userRepository);

  await assert.rejects(
    () =>
      useCase.execute({
        name: "Grace Hopper",
        email: "ada@example.com",
      }),
    {
      message: "User already exists",
    }
  );
});

test("ListUsersUseCase e GetUserByIdUseCase reutilizam o repositorio", async () => {
  const existingUser = new User("user-1", "Ada Lovelace", "ada@example.com");
  const userRepository = new InMemoryUserRepository([existingUser]);

  const listUsers = new ListUsersUseCase(userRepository);
  const getUserById = new GetUserByIdUseCase(userRepository);

  const users = await listUsers.execute();
  const selectedUser = await getUserById.execute("user-1");

  assert.equal(users.length, 1);
  assert.equal(users[0]?.email, "ada@example.com");
  assert.equal(selectedUser?.id, "user-1");
});

test("CreateOrderUseCase cria pedidos e os casos de leitura retornam os mesmos dados", async () => {
  const orderRepository = new InMemoryOrderRepository();
  const createOrder = new CreateOrderUseCase(orderRepository);
  const listOrders = new ListOrdersUseCase(orderRepository);
  const getOrderById = new GetOrderByIdUseCase(orderRepository);

  const order = await createOrder.execute({
    userId: "user-1",
    status: "paid",
    totalValue: 149.9,
  });

  const orders = await listOrders.execute();
  const foundOrder = await getOrderById.execute(order.id);

  assert.equal(order.userId, "user-1");
  assert.equal(order.status, "paid");
  assert.equal(order.totalValue, 149.9);
  assert.equal(orders.length, 1);
  assert.equal(foundOrder?.id, order.id);
});

test("CreateOrderDetailUseCase calcula subtotal e ListOrderDetailsUseCase filtra pelo pedido", async () => {
  const detailRepository = new InMemoryOrderDetailRepository([
    new OrderDetail("detail-2", "order-2", "Mouse", 1, 50, 50),
  ]);
  const createDetail = new CreateOrderDetailUseCase(detailRepository);
  const listOrderDetails = new ListOrderDetailsUseCase(detailRepository);

  const detail = await createDetail.execute({
    orderId: "order-1",
    productName: "Keyboard",
    quantity: 2,
    unitPrice: 75,
  });

  const orderOneDetails = await listOrderDetails.execute("order-1");
  const orderTwoDetails = await listOrderDetails.execute("order-2");

  assert.equal(detail.subtotal, 150);
  assert.equal(orderOneDetails.length, 1);
  assert.equal(orderOneDetails[0]?.productName, "Keyboard");
  assert.equal(orderTwoDetails.length, 1);
  assert.equal(orderTwoDetails[0]?.productName, "Mouse");
});

import assert from "node:assert/strict";
import test from "node:test";
import fastify from "fastify";

import { createInMemoryPrisma } from "../../../test/utils/in-memory-prisma";
import { userRoutes } from "./user-routes";
import { orderRoutes } from "./order-routes";
import { orderDetailRoutes } from "./order-detail-routes";

test("POST /users cria um usuario e GET /users o retorna na lista", async () => {
  const app = fastify();
  const prisma = createInMemoryPrisma();

  await userRoutes(app, prisma as never);

  const createResponse = await app.inject({
    method: "POST",
    url: "/users",
    payload: {
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "123456",
    },
  });

  assert.equal(createResponse.statusCode, 201);

  const createdUser = createResponse.json();
  assert.equal(createdUser.name, "Ada Lovelace");
  assert.equal(createdUser.email, "ada@example.com");

  const listResponse = await app.inject({
    method: "GET",
    url: "/users",
  });

  assert.equal(listResponse.statusCode, 200);

  const users = listResponse.json();
  assert.equal(users.length, 1);
  assert.equal(users[0].id, createdUser.id);

  await app.close();
});

test("GET /users/:id retorna 404 quando o usuario nao existe", async () => {
  const app = fastify();
  const prisma = createInMemoryPrisma();

  await userRoutes(app, prisma as never);

  const response = await app.inject({
    method: "GET",
    url: "/users/user-missing",
  });

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.json(), { message: "User not found" });

  await app.close();
});

test("POST /orders cria pedido e GET /orders/:id encontra o mesmo registro", async () => {
  const app = fastify();
  const prisma = createInMemoryPrisma();

  await orderRoutes(app, prisma as never);

  const createResponse = await app.inject({
    method: "POST",
    url: "/orders",
    payload: {
      userId: "user-1",
      status: "PENDING",
      totalValue: 199.9,
    },
  });

  assert.equal(createResponse.statusCode, 201);

  const createdOrder = createResponse.json();
  const getResponse = await app.inject({
    method: "GET",
    url: `/orders/${createdOrder.id}`,
  });

  assert.equal(getResponse.statusCode, 200);
  assert.equal(getResponse.json().status, "PENDING");

  await app.close();
});

test("POST /order-details calcula subtotal e GET /orders/:orderId/details filtra por pedido", async () => {
  const app = fastify();
  const prisma = createInMemoryPrisma({
    orderDetails: [
      {
        id: "detail-1",
        orderId: "order-2",
        productName: "Mouse",
        quantity: 1,
        unitPrice: 50,
        subtotal: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  });

  await orderDetailRoutes(app, prisma as never);

  const createResponse = await app.inject({
    method: "POST",
    url: "/order-details",
    payload: {
      orderId: "order-1",
      productName: "Keyboard",
      quantity: 2,
      unitPrice: 75,
    },
  });

  assert.equal(createResponse.statusCode, 201);
  assert.equal(createResponse.json().subtotal, 150);

  const listResponse = await app.inject({
    method: "GET",
    url: "/orders/order-1/details",
  });

  assert.equal(listResponse.statusCode, 200);

  const details = listResponse.json();
  assert.equal(details.length, 1);
  assert.equal(details[0].productName, "Keyboard");

  await app.close();
});

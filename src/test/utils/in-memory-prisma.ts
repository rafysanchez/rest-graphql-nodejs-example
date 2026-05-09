type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

type StoredOrder = {
  id: string;
  userId: string;
  status: string;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
};

type StoredOrderDetail = {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
};

type InMemoryPrismaSeed = {
  users?: StoredUser[];
  orders?: StoredOrder[];
  orderDetails?: StoredOrderDetail[];
};

function cloneDate(value: Date) {
  return new Date(value.getTime());
}

function cloneUser(user: StoredUser): StoredUser {
  return {
    ...user,
    createdAt: cloneDate(user.createdAt),
    updatedAt: cloneDate(user.updatedAt),
  };
}

function cloneOrder(order: StoredOrder): StoredOrder {
  return {
    ...order,
    createdAt: cloneDate(order.createdAt),
    updatedAt: cloneDate(order.updatedAt),
  };
}

function cloneOrderDetail(detail: StoredOrderDetail): StoredOrderDetail {
  return {
    ...detail,
    createdAt: cloneDate(detail.createdAt),
    updatedAt: cloneDate(detail.updatedAt),
  };
}

export function createInMemoryPrisma(seed: InMemoryPrismaSeed = {}) {
  let users = (seed.users ?? []).map(cloneUser);
  let orders = (seed.orders ?? []).map(cloneOrder);
  let orderDetails = (seed.orderDetails ?? []).map(cloneOrderDetail);

  return {
    user: {
      async create({ data }: { data: Omit<StoredUser, "createdAt" | "updatedAt"> }) {
        const now = new Date();
        const user: StoredUser = { ...data, createdAt: now, updatedAt: now };
        users.push(user);
        return cloneUser(user);
      },
      async findUnique({ where }: { where: { id?: string; email?: string } }) {
        const user = users.find((item) =>
          where.id ? item.id === where.id : item.email === where.email
        );

        return user ? cloneUser(user) : null;
      },
      async findMany({ where }: { where?: { id?: { in: string[] } } } = {}) {
        if (!where?.id?.in) {
          return users.map(cloneUser);
        }

        return users.filter((user) => where.id!.in.includes(user.id)).map(cloneUser);
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<Pick<StoredUser, "name" | "email" | "password">>;
      }) {
        const index = users.findIndex((item) => item.id === where.id);
        const updated: StoredUser = {
          ...users[index],
          ...data,
          updatedAt: new Date(),
        };
        users[index] = updated;
        return cloneUser(updated);
      },
      async delete({ where }: { where: { id: string } }) {
        users = users.filter((item) => item.id !== where.id);
      },
      async deleteMany() {
        users = [];
      },
    },
    order: {
      async create({ data }: { data: Omit<StoredOrder, "createdAt" | "updatedAt"> }) {
        const now = new Date();
        const order: StoredOrder = { ...data, createdAt: now, updatedAt: now };
        orders.push(order);
        return cloneOrder(order);
      },
      async findUnique({ where }: { where: { id: string } }) {
        const order = orders.find((item) => item.id === where.id);
        return order ? cloneOrder(order) : null;
      },
      async findMany({
        where,
      }: {
        where?: { userId?: string | { in: string[] } };
      } = {}) {
        if (!where?.userId) {
          return orders.map(cloneOrder);
        }

        if (typeof where.userId === "string") {
          return orders.filter((order) => order.userId === where.userId).map(cloneOrder);
        }

        return orders
          .filter((order) => (where.userId as { in: string[] }).in.includes(order.userId))
          .map(cloneOrder);
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<Pick<StoredOrder, "status" | "totalValue">>;
      }) {
        const index = orders.findIndex((item) => item.id === where.id);
        const updated: StoredOrder = {
          ...orders[index],
          ...data,
          updatedAt: new Date(),
        };
        orders[index] = updated;
        return cloneOrder(updated);
      },
      async delete({ where }: { where: { id: string } }) {
        orders = orders.filter((item) => item.id !== where.id);
      },
      async deleteMany() {
        orders = [];
      },
    },
    orderDetail: {
      async create({
        data,
      }: {
        data: Omit<StoredOrderDetail, "createdAt" | "updatedAt">;
      }) {
        const now = new Date();
        const detail: StoredOrderDetail = { ...data, createdAt: now, updatedAt: now };
        orderDetails.push(detail);
        return cloneOrderDetail(detail);
      },
      async findUnique({ where }: { where: { id: string } }) {
        const detail = orderDetails.find((item) => item.id === where.id);
        return detail ? cloneOrderDetail(detail) : null;
      },
      async findMany({
        where,
      }: {
        where?: { orderId?: string | { in: string[] } };
      } = {}) {
        if (!where?.orderId) {
          return orderDetails.map(cloneOrderDetail);
        }

        if (typeof where.orderId === "string") {
          return orderDetails
            .filter((detail) => detail.orderId === where.orderId)
            .map(cloneOrderDetail);
        }

        return orderDetails
          .filter((detail) => (where.orderId as { in: string[] }).in.includes(detail.orderId))
          .map(cloneOrderDetail);
      },
      async update({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<
          Pick<
            StoredOrderDetail,
            "productName" | "quantity" | "unitPrice" | "subtotal"
          >
        >;
      }) {
        const index = orderDetails.findIndex((item) => item.id === where.id);
        const updated: StoredOrderDetail = {
          ...orderDetails[index],
          ...data,
          updatedAt: new Date(),
        };
        orderDetails[index] = updated;
        return cloneOrderDetail(updated);
      },
      async delete({ where }: { where: { id: string } }) {
        orderDetails = orderDetails.filter((item) => item.id !== where.id);
      },
      async deleteMany() {
        orderDetails = [];
      },
    },
  };
}




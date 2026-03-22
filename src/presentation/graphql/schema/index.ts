export const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    orders: [Order!]!
    createdAt: String!
    updatedAt: String!
  }

  type Order {
    id: ID!
    userId: ID!
    user: User!
    status: String!
    totalValue: Float!
    details: [OrderDetail!]!
    createdAt: String!
    updatedAt: String!
  }

  type OrderDetail {
    id: ID!
    orderId: ID!
    productName: String!
    quantity: Int!
    unitPrice: Float!
    subtotal: Float!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    orders: [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    createUser(name: String!, email: String!, password: String): User!
    createOrder(userId: ID!, status: String!, totalValue: Float!): Order!
  }
`;

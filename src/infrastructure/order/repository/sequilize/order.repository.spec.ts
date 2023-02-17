import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

async function addCustomer(): Promise<Customer> {
  const customerRepository = new CustomerRepository();
  const customer = new Customer("123", "Customer 1");
  const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
  customer.changeAddress(address);
  await customerRepository.create(customer);

  return customer;
}

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customer = await addCustomer();

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", customer.id, [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: customer.id,
      total: order.total(),
      items: [
        {
          id: ordemItem.id,
          name: ordemItem.name,
          price: ordemItem.price,
          quantity: ordemItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find a order", async () => {
    const customer = await addCustomer();

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", customer.id, [ordemItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderResult = await orderRepository.find(customer.id);

    expect(order).toStrictEqual(orderResult);
  });

  it("should update order", async () => {
    const customer = await addCustomer();

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    let orderItems = [orderItem];

    let order = new Order("123", customer.id, orderItems);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const newOrderItem = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      4
    );

    orderItems = [newOrderItem];

    //first check
    order = new Order("123", customer.id, orderItems);

    await orderRepository.update(order);

    let orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.items.length).toEqual(1);

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: customer.id,
      total: order.total(),
      items: orderItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        order_id: order.id,
        product_id: item.productId,
      })),
    });

    //second check
    const newOrderItem2 = new OrderItem(
      "3",
      product.name,
      product.price,
      product.id,
      1
    );
    const newOrderItem3 = new OrderItem(
      "43",
      product.name,
      product.price,
      product.id,
      5
    );

    orderItems = [newOrderItem, newOrderItem2, newOrderItem3];

    order = new Order("123", customer.id, orderItems);

    await orderRepository.update(order);

    orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.items.length).toEqual(3);

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customer_id: customer.id,
      total: order.total(),
      items: orderItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        order_id: order.id,
        product_id: item.productId,
      })),
    });
  });

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();

    expect(async () => {
      await orderRepository.find("456ABC");
    }).rejects.toThrow("Order not found");
  });

  it("should find all orders", async () => {
    const customer = await addCustomer();

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const ordemItem1 = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const ordemItem2 = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      3
    );

    const order1 = new Order("123", customer.id, [ordemItem1]);
    const order2 = new Order("1234", customer.id, [ordemItem2]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const orders = await orderRepository.findAll();

    expect(orders).toHaveLength(2);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
  });
});

import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total(),
      },
      {
        where: {
          id: entity.id,
        },
      }
    ).then(() => {
      OrderItemModel.destroy({
        where: {
          order_id: entity.id,
        },
      });

      OrderItemModel.bulkCreate(
        entity.items.map((item) => ({
          order_id: entity.id,
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        }))
      );
    });
  }

  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        rejectOnEmpty: true,
        include: [{ model: OrderItemModel }],
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    let items = this.mapToOrderItems(orderModel.items);

    const order = new Order(id, orderModel.customer_id, items);

    return order;
  }

  private mapToOrderItem(item: OrderItemModel): OrderItem {
    return new OrderItem(
      item.id,
      item.name,
      item.price,
      item.product_id,
      item.quantity
    );
  }

  private mapToOrderItems(items: OrderItemModel[]): OrderItem[] {
    return items.map((item) => this.mapToOrderItem(item));
  }

  async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({
      include: [{ model: OrderItemModel }],
    });

    const orders = orderModels.map((orderModel) => {
      let items = this.mapToOrderItems(orderModel.items);

      const order = new Order(orderModel.id, orderModel.customer_id, items);

      return order;
    });

    return orders;
  }
}

import { Order } from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { Client } from '../models/clientModel.js'; // Corrected import

export const createOrderService = async (orderData) => {
  const { orderItems, shippingAddress, client: clientId } = orderData;

  if (!orderItems || orderItems.length === 0) {
    throw new Error('No order items');
  }

  if (!shippingAddress) {
    throw new Error('No shipping address');
  }

  if (!clientId) {
    throw new Error('No client');
  }

  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error('Client not found');
  }

  // 1. Get product details from the database
  const populatedOrderItems = await Promise.all(
    orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product with ID ${item.product} not found`);
      }

      return {
        ...item,
        sku: product.sku,
        title: product.title,
        image_url: product.image_url,
        price: product.price,
      };
    })
  );

  // 2. Calculate prices based on 2x1000 promotion
  const totalQuantity = populatedOrderItems.reduce((acc, item) => acc + item.quantity, 0);
  const pairs = Math.floor(totalQuantity / 2);
  const singles = totalQuantity % 2;

  // Logic: 2 for 1000, 1 for 600
  const itemsPrice = (pairs * 1000) + (singles * 600);

  const taxPrice = 0; // Simplified for this project
  const shippingPrice = totalQuantity >= 2 ? 0 : 0; // In this project, itemsPrice already considers the "A COTIZAR" total if 1 item

  const totalPrice = itemsPrice; // Total final de los artículos

  // 3. Create a new order
  const order = new Order({
    orderItems: populatedOrderItems,
    client: clientId,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  return createdOrder;
};

export const getOrdersService = async (options) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search } = options;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  let query = {};
  if (search) {
    query = {
      $expr: {
        $regexMatch: {
          input: { $toString: "$_id" },
          regex: search,
          options: "i"
        }
      }
    };
  }

  const orders = await Order.find(query)
    .populate('client', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .lean({ virtuals: true });

  const total = await Order.countDocuments(query);

  return {
    orders,
    totalPages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    total,
  };
};

export const getOrderByIdService = async (id) => {
  const order = await Order.findById(id).populate('client', 'name email');
  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

export const updateOrderStatusService = async (id, status) => {
  const order = await Order.findById(id);

  if (!order) {
    throw new Error('Order not found');
  }

  order.status = status;

  if (status === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  if (status === 'Paid') {
    order.isPaid = true;
    order.paidAt = Date.now();
  }

  const updatedOrder = await order.save();
  return updatedOrder;
};

export const deleteOrderService = async (id) => {
  const order = await Order.findById(id);

  if (!order) {
    throw new Error('Order not found');
  }

  await Order.findByIdAndDelete(id);

  return { message: 'Order deleted successfully' };
};

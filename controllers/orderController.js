const Order = require("../models/Order");
const Product = require("../models/Product");
const { checkPermissions } = require("../util");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");

const fakeStripeApi = async ({ amount, currency }) => {
  const clientSecret = "1234567890abcdef";
  return { clientSecret, amount };
};

const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError("NO cart items provided");
  }
  if (!shippingFee || !tax) {
    throw new CustomError.BadRequestError(
      "Please provide tax and shipping amount"
    );
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const productDb = await Product.findOne({ _id: item.product });
    if (!productDb) {
      throw new CustomError.NotFoundError(
        `no product found for id : ${item.product}`
      );
    }
    const { name, _id, price, image } = productDb;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    orderItems = [...orderItems, singleOrderItem];
    subtotal += item.amount * price;
  }
  const total = subtotal + tax + shippingFee;
  const paymentIntenet = await fakeStripeApi({
    amount: total,
    currency: "usd",
  });
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    shippingFee,
    tax,
    clientSecret: paymentIntenet.clientSecret,
    user: req.user.id,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrder = async (req, res) => {
  const userId = req.user.id;
  const orders = await Order.find({ user: userId });
  if (!orders) {
    throw new CustomError.NotFoundError(`No orders with id ${userId}`);
  }
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrder,
  createOrder,
  updateOrder,
};

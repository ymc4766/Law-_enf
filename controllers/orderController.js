import Order from "../models/orderModal.js";
import Product from "../models/productModal.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const newOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    approvedStatus,
    approvedStatusProcur,
    itemsPrice,
    totalPrice,
    paymentMethod,
    invoiceNumber,
    requisitionSteps,
  } = req.body;

  const createdOrder = await Order.create({
    orderItems: orderItems?.map((x) => ({
      product: x._id,
      name: x.name,
      qty: x.qty,
      category: x.category,
      stock: x.stock,
      supplier: x.supplier,
    })),
    user: req.user._id,
    orderItems,
    shippingAddress,
    approvedStatus,
    approvedStatusProcur,
    itemsPrice,
    totalPrice,
    paymentMethod,
    invoiceNumber,
    requisitionSteps,
  });

  res.status(201).json(createdOrder);
});

export const allOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id name  dept ")
    .sort("-createdAt");
  res.json(orders);
});

export const myOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.status(200).json({ orders });
});

export const orderDetails = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .sort("-createdAt")
    .populate("user", "name email");
  res.status(200).json({ order });
});

// update Order for Factory REquisition And DECREMENT the STOCK
export const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order)
    return res.status(403).json({ message: "NO Order Found this ID" });

  // update product stock

  order?.orderItems?.forEach(async (item) => {
    const product = await Product.findById(item?.product?.toString());

    if (!product) {
      res.status(404).json({ message: "Not FOUND PRODUCT" });
    }
    // Ensure item.stock is a valid number
    product.stock = product.stock - item.qty;
    await product.save({ validateBeforeSave: false });
  });

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

// updateOrder Delver and increment stock // procurement
export const updateOrderProcur = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No Order found with this ID", 404));
  }

  // order.approvedStatus = req.body.approvedStatus;

  if (order?.isDelivered) {
    return next(new ErrorHandler("You have already processed this order", 400));
  }

  // Update products stock
  order?.orderItems?.forEach(async (item) => {
    const product = await Product.findById(item?.product?.toString());
    if (!product) {
      return next(new ErrorHandler("No Product found with this ID", 404));
    }
    product.stock = product.stock + item.qty;

    if (item.updatedPrice) {
      product.price = item.updatedPrice;
    }

    await product.save({ validateBeforeSave: false });
  });

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  // await order.save();

  // res.status(200).json({
  //   success: true,
  //   order,
  // });

  const updatedOrder = await order.save();

  res.json(updatedOrder);
});

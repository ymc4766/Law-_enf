import express from "express";
import {
  allOrders,
  myOrders,
  newOrder,
  orderDetails,
  updateOderItemPrice,
  updateOrder,
  updateOrderProcur,
} from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/create").post(protect, newOrder);
router.route("/mine").get(protect, myOrders);
router.route("/").get(protect, allOrders);

router.get("/:id", protect, orderDetails);

router.route("/:id/updatestock").put(protect, updateOrder);

router.route("/deliver/procur/:id").put(protect, updateOrderProcur);
router.put("/updateItemPrice/:itemId", protect, updateOderItemPrice);

export default router;

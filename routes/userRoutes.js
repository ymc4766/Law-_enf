import express from "express";
import {
  allUsers,
  authUser,
  editUserClr,
  register,
} from "../controllers/userControllers.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", authUser);

router.route("/").get(allUsers);

router.route("/:id").put(protect, editUserClr);

export default router;

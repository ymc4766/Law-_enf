import User from "../models/userModal.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, dept } = req.body;

  const existUser = await User.findOne({ email });
  if (existUser) {
    res.status(403).json({ message: "User Already Exit" });
  }

  const user = await User.create({
    name,
    email,
    password,
    dept,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      password: user.password,
      dept: user.dept,
      procurement: user.procurement,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("Invalid data , Try Again");
  }
});

export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    const token = generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      dept: user.dept,
      isAdmin: user.isAdmin,
      token: token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email and Password , try again");
  }
});

export const editUserClr = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.dept = req.body.dept || user.dept;
    user.procurement = req.body.procurement || user.procurement;

    user.isAdmin = req.body.isAdmin || user.isAdmin;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      dept: updatedUser.dept,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
export const allUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  res.status(201).json(users);
});

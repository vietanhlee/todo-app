import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import fs from "fs";

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: 3 * 24 * 60 * 60 });

const sanitize = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.resetToken;
  return obj;
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ message: "Please enter all fields" });
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "User does not exist" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = createToken(user._id);
    res.status(200).json({ user: sanitize(user), token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await userModel.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });
    if (!name || !email || !password)
      return res.status(400).json({ message: "Please enter all fields" });
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Please enter a valid email" });
    if (!validator.isStrongPassword(password))
      return res
        .status(400)
        .json({ message: "Please enter a strong password" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
    }).save();
    const token = createToken(user._id);
    res.status(200).json({ user: sanitize(user), token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("-password -resetToken");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(502).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { name, bio, phone } = req.body;
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name?.trim()) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (phone !== undefined) user.phone = phone.trim();
    await user.save();
    res.status(200).json({ user: sanitize(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadAvatarHandler = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const fileUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = fileUrl;
    await user.save();
    res.status(200).json({ avatar: fileUrl, user: sanitize(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password is incorrect" });
    if (!validator.isStrongPassword(newPassword))
      return res
        .status(400)
        .json({ message: "New password is not strong enough" });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAccount = async (req, res) => {
  const { password } = req.body;
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Password is incorrect" });
    await userModel.findByIdAndDelete(req.user.id);
    res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  getUser,
  updateProfile,
  uploadAvatarHandler,
  changePassword,
  deleteAccount,
};

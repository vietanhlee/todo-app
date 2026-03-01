import express from "express";
import {
  loginUser,
  registerUser,
  getUser,
  updateProfile,
  uploadAvatarHandler,
  changePassword,
  deleteAccount,
} from "../controllers/userController.js";
import requireAuth from "../middleware/requireAuth.js";
import { uploadAvatar } from "../middleware/upload.js";
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/getuser", requireAuth, getUser);
router.put("/profile", requireAuth, updateProfile);
router.post("/avatar", requireAuth, uploadAvatar, uploadAvatarHandler);
router.put("/password", requireAuth, changePassword);
router.delete("/account", requireAuth, deleteAccount);

export default router;

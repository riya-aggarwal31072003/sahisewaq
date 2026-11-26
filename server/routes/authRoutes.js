import express from "express";
import { login, getMe, registerUser } from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/register", protect, authorize("admin"), registerUser);

export default router;
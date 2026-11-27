import express from "express";
import { tokenStatus, serviceSummary, waitingList } from "../controllers/queueController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/status", tokenStatus);
router.get("/service/:serviceId", serviceSummary);
router.get("/service/:serviceId/waiting", protect, authorize("admin", "staff"), waitingList);

export default router;
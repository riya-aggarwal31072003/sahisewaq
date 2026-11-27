import express from "express";
import {
  createToken, lookupToken, cancelToken, rescheduleToken, setPriority,
} from "../controllers/tokenController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createToken);
router.get("/lookup", lookupToken);
router.put("/:id/cancel", cancelToken);
router.put("/:id/reschedule", rescheduleToken);
router.put("/:id/priority", protect, authorize("admin"), setPriority);

export default router;
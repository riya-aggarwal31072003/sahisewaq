import express from "express";
import {
  myCounter, setStatus, callNext, completeToken, skipToken,
} from "../controllers/staffController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("staff"));

router.get("/counter", myCounter);
router.put("/counter/status", setStatus);
router.post("/counter/call-next", callNext);
router.put("/tokens/:id/complete", completeToken);
router.put("/tokens/:id/skip", skipToken);

export default router;
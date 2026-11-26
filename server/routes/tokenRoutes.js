import express from "express";
import {
  createToken, lookupToken, cancelToken, rescheduleToken,
} from "../controllers/tokenController.js";

const router = express.Router();

router.post("/", createToken);
router.get("/lookup", lookupToken);
router.put("/:id/cancel", cancelToken);
router.put("/:id/reschedule", rescheduleToken);

export default router;
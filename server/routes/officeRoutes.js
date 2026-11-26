import express from "express";
import Office from "../models/Office.js";
import { crud } from "../utils/crud.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
const c = crud(Office);

router.get("/", c.getAll);
router.get("/:id", c.getOne);
router.post("/", protect, authorize("admin"), c.create);
router.put("/:id", protect, authorize("admin"), c.update);
router.delete("/:id", protect, authorize("admin"), c.remove);

export default router;
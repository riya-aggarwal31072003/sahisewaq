import express from "express";
import Counter from "../models/Counter.js";
import { crud } from "../utils/crud.js";
import { assignStaff } from "../controllers/counterController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
const c = crud(Counter, { filterKeys: ["officeId", "status"], populate: "serviceIds staffId" });

router.use(protect);
router.get("/", authorize("admin", "staff"), c.getAll);
router.get("/:id", authorize("admin", "staff"), c.getOne);
router.post("/", authorize("admin"), c.create);
router.put("/:id/assign", authorize("admin"), assignStaff);
router.put("/:id", authorize("admin"), c.update);
router.delete("/:id", authorize("admin"), c.remove);

export default router;
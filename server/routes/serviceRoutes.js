import express from "express";
import Service from "../models/Service.js";
import { crud } from "../utils/crud.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
const c = crud(Service, { filterKeys: ["officeId", "department"] });

router.get("/", c.getAll);
router.get("/:id", c.getOne);
router.post("/", protect, authorize("admin"), c.create);
router.put("/:id", protect, authorize("admin"), c.update);
router.delete("/:id", protect, authorize("admin"), c.remove);

export default router;
import { Router } from "express";
import * as ctrl from "./professors.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createProfessorSchema,
  updateProfessorSchema,
} from "./professors.schema";

const router = Router();

router.use(authenticate, authorize("admin", "academicUnit"));

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", validate(createProfessorSchema), ctrl.create);
router.put("/:id", validate(updateProfessorSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;

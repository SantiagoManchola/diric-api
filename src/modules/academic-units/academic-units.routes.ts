import { Router } from "express";
import * as ctrl from "./academic-units.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createAcademicUnitSchema,
  updateAcademicUnitSchema,
  associateProfessorSchema,
} from "./academic-units.schema";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", validate(createAcademicUnitSchema), ctrl.create);
router.put("/:id", validate(updateAcademicUnitSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

router.post(
  "/:id/professors",
  validate(associateProfessorSchema),
  ctrl.associateProfessor,
);
router.delete(
  "/:academicUnitId/professors/:professorId",
  ctrl.disassociateProfessor,
);

export default router;

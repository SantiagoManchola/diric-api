import { Router } from "express";
import * as ctrl from "./projects.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createProjectSchema,
  updateProjectSchema,
  createAssignmentSchema,
} from "./projects.schema";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin", "academicUnit", "profesor"), ctrl.getAll);
router.get(
  "/:id",
  authorize("admin", "academicUnit", "profesor"),
  ctrl.getById,
);
router.post(
  "/",
  authorize("admin", "academicUnit"),
  validate(createProjectSchema),
  ctrl.create,
);
router.put(
  "/:id",
  authorize("admin", "academicUnit", "profesor"),
  validate(updateProjectSchema),
  ctrl.update,
);
router.delete("/:id", authorize("admin", "academicUnit"), ctrl.remove);

router.post(
  "/:id/assignments",
  authorize("admin", "academicUnit"),
  validate(createAssignmentSchema),
  ctrl.addAssignment,
);
router.delete(
  "/:projectId/assignments/:assignmentId",
  authorize("admin", "academicUnit"),
  ctrl.removeAssignment,
);

export default router;

import { Router } from "express";
import * as ctrl from "./events.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createEventSchema,
  updateEventSchema,
  createAttendeeSchema,
  updateAttendeeSchema,
} from "./events.schema";

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
  authorize("admin", "academicUnit", "profesor"),
  validate(createEventSchema),
  ctrl.create,
);
router.put(
  "/:id",
  authorize("admin", "academicUnit", "profesor"),
  validate(updateEventSchema),
  ctrl.update,
);
router.delete("/:id", authorize("admin", "academicUnit"), ctrl.remove);

router.post(
  "/:id/attendees",
  authorize("admin", "academicUnit", "profesor"),
  validate(createAttendeeSchema),
  ctrl.addAttendee,
);
router.patch(
  "/:eventId/attendees/:attendeeId",
  authorize("admin", "academicUnit", "profesor"),
  validate(updateAttendeeSchema),
  ctrl.updateAttendee,
);
router.delete(
  "/:eventId/attendees/:attendeeId",
  authorize("admin", "academicUnit", "profesor"),
  ctrl.removeAttendee,
);

export default router;

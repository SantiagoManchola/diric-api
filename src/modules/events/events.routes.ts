import { Router } from "express";
import * as ctrl from "./events.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { imageUpload } from "../../middleware/upload";
import {
  createEventSchema,
  updateEventSchema,
  createAttendeeSchema,
  updateAttendeeSchema,
} from "./events.schema";

const router = Router();

router.use(authenticate);

// ── Events CRUD ───────────────────────────────────────────────────────────────
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

// ── Attendees ─────────────────────────────────────────────────────────────────
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

// ── Images ────────────────────────────────────────────────────────────────────
router.get(
  "/:id/images",
  authorize("admin", "academicUnit", "profesor"),
  ctrl.getImages,
);
router.post(
  "/:id/images",
  authorize("admin", "academicUnit", "profesor"),
  imageUpload.array("images", 20),
  ctrl.uploadImages,
);
router.delete(
  "/:id/images/:imageId",
  authorize("admin", "academicUnit", "profesor"),
  ctrl.deleteImage,
);

// ── PDF history ───────────────────────────────────────────────────────────────
router.get(
  "/:id/pdfs",
  authorize("admin", "academicUnit", "profesor"),
  ctrl.getPdfVersions,
);
router.get(
  "/:id/pdfs/latest",
  authorize("admin", "academicUnit", "profesor"),
  ctrl.getLatestPdf,
);
router.post(
  "/:id/pdfs/regenerate",
  authorize("admin", "academicUnit"),
  ctrl.regeneratePdf,
);

export default router;

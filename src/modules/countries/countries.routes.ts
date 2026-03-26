import { Router } from "express";
import * as ctrl from "./countries.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { createCountrySchema, updateCountrySchema } from "./countries.schema";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", validate(createCountrySchema), ctrl.create);
router.put("/:id", validate(updateCountrySchema), ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;

import { Router } from "express";
import * as ctrl from "./auth.controller";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { loginSchema, googleLoginSchema } from "./auth.schema";

const router = Router();

router.post("/login", validate(loginSchema), ctrl.login);
router.post("/google", validate(googleLoginSchema), ctrl.googleLogin);
router.post("/logout", authenticate, ctrl.logout);
router.get("/session", authenticate, ctrl.getSession);

export default router;

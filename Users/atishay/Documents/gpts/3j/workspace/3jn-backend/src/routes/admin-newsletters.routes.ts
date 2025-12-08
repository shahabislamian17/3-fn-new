// backend/src/routes/admin-newsletters.ts
import { Router } from "express";
import { previewNewsletter, sendNewsletter, getNewsletterHistory } from "@/controllers/admin-newsletters.controller";
import { requireRole } from "../middleware/rbac.middleware";

const router = Router();

router.post(
  "/preview",
  requireRole("Admin"),
  previewNewsletter
);

router.post(
  "/send",
  requireRole("Admin"),
  sendNewsletter
);

router.get(
  "/history",
  requireRole("Admin"), 
  getNewsletterHistory
);

export default router;

// backend/src/routes/investments.routes.ts
import { Router } from "express";
import { requireRole } from "@/middleware/rbac.middleware";
import { requireKycPassed } from "../middleware/kyc.middleware";
import { createInvestment } from "@/controllers/investment.controller";

const router = Router();

router.post(
  "/",
  requireRole("Investor"),
  requireKycPassed("invest"),
  createInvestment
);

export default router;

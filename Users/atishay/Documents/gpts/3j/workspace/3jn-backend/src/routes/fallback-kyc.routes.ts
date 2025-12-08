// backend/src/routes/fallback-kyc.ts
import { Router } from "express";
import { getFallbackKycStatus, startFallbackKyc, uploadFallbackKycDocs } from "@/controllers/fallback-kyc.controller";
import { protect } from "@/middleware/auth.middleware";

const router = Router();

router.get("/status", protect, getFallbackKycStatus);
router.post("/start", protect, startFallbackKyc);
router.post("/:id/documents", protect, uploadFallbackKycDocs);

export default router;

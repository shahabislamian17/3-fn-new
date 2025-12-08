
// backend/src/routes/kyc.routes.ts
import { Router } from "express";
import { createKycSession, kycWebhook } from "@/controllers/kyc.controller";
import { protect } from "@/middleware/auth.middleware";

const router = Router();

// This endpoint is protected and creates a session for the authenticated user
router.post("/session", protect, createKycSession);

// Webhook endpoints are public but should have signature validation inside the controller
router.post("/webhook/:provider", kycWebhook);

export default router;

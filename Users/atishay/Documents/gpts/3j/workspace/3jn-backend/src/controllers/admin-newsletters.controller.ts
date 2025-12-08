
// backend/src/controllers/admin-newsletters.controller.ts
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { adminDb } from "../core/firebase";
import { generateNewsletterHtml } from "../lib/ai-newsletter";
import {
  NewsletterRequest,
  NewsletterDocument,
  NewsletterAudience,
} from "../types/newsletter";

/**
 * Role safety:
 * - superadmin: can send to any audience
 * - admin: cannot send to all_users
 * - compliance: only investors / filtered_users
 */
function validateAudienceForRole(
  role: string | undefined,
  audience: NewsletterAudience
): boolean {
  if (!role) return false;
  if (role === "SuperAdmin") return true;

  if (role === "Admin") {
    return audience !== "all_users";
  }

  if (role === "ComplianceOfficer") {
    return audience === "investors" || audience === "filtered_users";
  }

  return false;
}

export const previewNewsletter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const body = req.body as NewsletterRequest;
      const actorRole = req.user?.role;

      if (!validateAudienceForRole(actorRole, body.audience)) {
        return res
          .status(403)
          .json({ error: "unauthorised_newsletter_scope" });
      }

      const { subject, preview, html } = await generateNewsletterHtml(body);
      res.json({ subject, preview, html });
    } catch (err: any) {
      console.error("Error generating preview", err);
      res.status(500).json({ error: "Preview generation failed" });
    }
};


export const sendNewsletter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
     try {
      const actor = req.user;
      if (!actor?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const body = req.body as NewsletterRequest;

      if (!validateAudienceForRole(actor.role, body.audience)) {
        return res
          .status(403)
          .json({ error: "unauthorised_newsletter_scope" });
      }

      const { subject, preview, html } = await generateNewsletterHtml(body);

      const newsletter: NewsletterDocument = {
        createdAt: new Date(),
        createdByUid: actor.id,
        createdByEmail: actor.email ?? null,
        audience: body.audience,
        filters: body.filters,
        topic: body.topic,
        subject,
        message: body.message,
        html,
        ctaUrl: body.ctaUrl,
        ctaLabel: body.ctaLabel,
        language: body.language ?? "auto",
        status: "queued",
      };

      const ref = await adminDb.collection("newsletters").add(newsletter);

      // In a real app, you would have an audit log service.
      console.log('AUDIT_LOG: NEWSLETTER_CREATED', {
          actorUid: actor.id,
          newsletterId: ref.id,
          audience: body.audience,
      });

      res.status(201).json({
        id: ref.id,
        subject,
        preview,
        status: "queued",
      });
    } catch (err: any) {
      console.error("Error queueing newsletter", err);
      res.status(500).json({ error: "Newsletter send failed" });
    }
};


export const getNewsletterHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const snap = await adminDb
        .collection("newsletters")
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

        const results = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        }));

        res.json(results);
    } catch(err) {
        next(err);
    }
};

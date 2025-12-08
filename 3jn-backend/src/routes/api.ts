
import { Router } from 'express';
import authRouter from './auth.routes';
import projectsRouter from './projects.routes';
import userRouter from './user.routes';
import adminRouter from './admin.routes';
import notificationsRouter from './notifications.routes';
import stripeRouter from './stripe.routes';
import plaidRouter from './plaid.routes';
import checkoutRouter from './checkout.routes';
import investmentsRouter from './investments.routes';
import adminKycRouter from './admin-kyc.routes';
import adminNewslettersRouter from './admin-newsletters.routes';
import fallbackKycRouter from './fallback-kyc.routes';
import adminFallbackKycRouter from './admin-fallback-kyc.routes';
import { protect, proxyUserAuth } from '@/middleware/auth.middleware';
import { getProjects, getProjectBySlug } from '@/controllers/project.controller';
import adminOverridesRouter from './admin-overrides.routes';
import retrainFeedbackRouter from './retrain-feedback.routes';
import complianceSummaryRouter from './compliance-summary.routes';
import adminAutoApprovalRouter from './admin-auto-approval.routes';

const router = Router();

// Client-facing routes (auth handled by 'protect' middleware)
const clientFacingRouter = Router();
clientFacingRouter.use(protect);
clientFacingRouter.use('/user', userRouter);
clientFacingRouter.use('/investments', investmentsRouter);
clientFacingRouter.use('/kyc/fallback', fallbackKycRouter);
clientFacingRouter.use('/notifications', notificationsRouter);
clientFacingRouter.use('/stripe', stripeRouter);
clientFacingRouter.use('/plaid', plaidRouter);
clientFacingRouter.use('/checkout', checkoutRouter);
clientFacingRouter.use('/projects', projectsRouter); // For create/update operations

// Admin routes - they have their own specific role protection internally
const adminApiRouter = Router();
adminApiRouter.use(protect); // Admins must be authenticated first
adminApiRouter.use('/admin', adminRouter);
adminApiRouter.use('/admin/kyc', adminKycRouter);
adminApiRouter.use('/admin/newsletters', adminNewslettersRouter);
adminApiRouter.use('/admin/fallback-kyc', adminFallbackKycRouter);
adminApiRouter.use('/admin/overrides', adminOverridesRouter);
adminApiRouter.use('/admin/retrain-feedback', retrainFeedbackRouter);
adminApiRouter.use('/admin/compliance-summary', complianceSummaryRouter);
adminApiRouter.use('/admin/auto-approval', adminAutoApprovalRouter);


// Public routes that don't need any auth
const publicRouter = Router();
publicRouter.get('/projects', getProjects); // Public listing of projects
publicRouter.get('/projects/:slug', getProjectBySlug);


// Main router assembly
router.use('/auth', authRouter); // Login/logout handled separately
router.use(clientFacingRouter);
router.use(adminApiRouter);
router.use(publicRouter);

export default router;

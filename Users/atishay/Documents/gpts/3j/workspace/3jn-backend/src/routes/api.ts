
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
import kycRouter from './kyc.routes';
import { protect } from '@/middleware/auth.middleware';
import { getProjects, getProjectBySlug } from '@/controllers/project.controller';
import adminOverridesRouter from './admin-overrides.routes';
import retrainFeedbackRouter from './retrain-feedback.routes';
import complianceSummaryRouter from './compliance-summary.routes';
import adminAutoApprovalRouter from './admin-auto-approval.routes';

const router = Router();

// --- PUBLIC ROUTES ---
const publicRouter = Router();
publicRouter.get('/projects', getProjects);
publicRouter.get('/projects/:slug', getProjectBySlug);
// Webhooks are public but secured with signatures inside the controllers
publicRouter.post('/stripe/webhook', stripeRouter); 
publicRouter.post('/kyc/webhook/:provider', kycRouter);

// --- AUTHENTICATION ROUTES ---
const authApiRouter = Router();
authApiRouter.use('/auth', authRouter);

// --- USER-FACING PROTECTED ROUTES ---
const clientFacingRouter = Router();
clientFacingRouter.use(protect);
clientFacingRouter.use('/user', userRouter);
clientFacingRouter.use('/investments', investmentsRouter);
clientFacingRouter.use('/kyc/fallback', fallbackKycRouter);
clientFacingRouter.use('/kyc', kycRouter);
clientFacingRouter.use('/notifications', notificationsRouter);
clientFacingRouter.use('/stripe', stripeRouter);
clientFacingRouter.use('/plaid', plaidRouter);
clientFacingRouter.use('/checkout', checkoutRouter);
clientFacingRouter.use('/projects', projectsRouter); 

// --- ADMIN PROTECTED ROUTES ---
const adminApiRouter = Router();
adminApiRouter.use(protect); 
adminApiRouter.use('/admin', adminRouter);
adminApiRouter.use('/admin/kyc', adminKycRouter);
adminApiRouter.use('/admin/newsletters', adminNewslettersRouter);
adminApiRouter.use('/admin/fallback-kyc', adminFallbackKycRouter);
adminApiRouter.use('/admin/overrides', adminOverridesRouter);
adminApiRouter.use('/admin/retrain-feedback', retrainFeedbackRouter);
adminApiRouter.use('/admin/compliance-summary', complianceSummaryRouter);
adminApiRouter.use('/admin/auto-approval', adminAutoApprovalRouter);


// --- MAIN ROUTER ASSEMBLY ---
router.use(publicRouter);
router.use(authApiRouter);
router.use(clientFacingRouter);
router.use(adminApiRouter);

export default router;

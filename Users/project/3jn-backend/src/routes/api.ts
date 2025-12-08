import { Router } from 'express';
import authRouter from './auth.routes';
import projectsRouter from './projects.routes';
import userRouter from './user.routes';
import adminRouter from './admin.routes';
import notificationsRouter from './notifications.routes';
import stripeRouter from './stripe.routes';
import plaidRouter from './plaid.routes';
import checkoutRouter from './checkout.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/projects', projectsRouter);
router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/notifications', notificationsRouter);
router.use('/stripe', stripeRouter);
router.use('/plaid', plaidRouter);
router.use('/checkout', checkoutRouter);


export default router;

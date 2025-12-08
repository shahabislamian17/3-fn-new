import { Router } from 'express';
import { getNotifications } from '@/controllers/notifications.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

router.get('/', protect, getNotifications);

export default router;

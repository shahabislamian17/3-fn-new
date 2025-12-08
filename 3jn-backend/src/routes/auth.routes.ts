import { Router } from 'express';
import { login, logout } from '@/controllers/auth.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

// These routes are special because they deal with cookies directly from the client.
// They bypass the server token protection but use their own cookie-based protection.
router.post('/login', login); 
router.post('/logout', protect, logout);

export default router;

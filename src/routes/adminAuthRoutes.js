import { Router } from 'express';
const router = Router();
import { loginAdmin, logoutAdmin, verifyToken } from '../controllers/auth/adminAuthController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/verify', authMiddleware, verifyToken);



export default router;


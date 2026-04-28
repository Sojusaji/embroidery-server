import { Router } from 'express';
const router = Router();
import { loginAdmin, verifyToken, getAdmins, addAdmin, deleteAdmin } from '../controllers/adminAuthController.js';
import authMiddleware, { restrictTo } from '../middlewares/authMiddleware.js';

router.post('/login', loginAdmin);
router.get('/verify', authMiddleware, verifyToken);

// Admin management routes (Super Admin only)
router.get('/admins', authMiddleware, restrictTo('superAdmin'), getAdmins);
router.post('/admins', authMiddleware, restrictTo('superAdmin'), addAdmin);
router.delete('/admins/:id', authMiddleware, restrictTo('superAdmin'), deleteAdmin);

export default router;


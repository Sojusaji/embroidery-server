// routes/adminRoutes.js
import { Router } from 'express';
import { 
  getAdmins, 
  addAdmin, 
  deleteAdmin, 
  getDashboardSummary 
} from '../controllers/auth/adminAuthController.js';
import authMiddleware, { restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);


router.get('/dashboard-summary', restrictTo('admin', 'superAdmin'), getDashboardSummary);


router.route('/')
  .get(restrictTo('superAdmin'), getAdmins)
  .post(restrictTo('superAdmin'), addAdmin);

router.delete('/:id', restrictTo('superAdmin'), deleteAdmin);

export default router;
// routes/adminRoutes.js
import { Router } from 'express';
import {
  getAdmins,
  addAdmin,
  deleteAdmin,
  getDashboardSummary,
} from '../controllers/admin/adminController.js';
import {
  getCustomersData,
  blockCustomer,
  deleteCustomer,
  getOrders,
  getOrdersCount
} from "../controllers/admin/customerDataController.js";
import {
  deleteCustomerSchema,
  blockCustomerSchema,
  getOrdersQuerySchema
} from "../utils/authValidator.js";
import { validate } from "../middlewares/validate.js";
import { authMiddleware, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware);


router.get('/dashboard-summary', restrictTo('admin', 'superAdmin'), getDashboardSummary);


router.route('/')
  .get(restrictTo('superAdmin'), getAdmins)
  .post(restrictTo('superAdmin'), addAdmin);


router.get('/customer', restrictTo('admin', 'superAdmin'), getCustomersData);
router.patch('/customer/:id/block', restrictTo('admin', 'superAdmin'), validate(blockCustomerSchema), blockCustomer);
router.delete('/customer/:id/delete', restrictTo('admin', 'superAdmin'), validate(deleteCustomerSchema), deleteCustomer);


router.get('/orders', restrictTo('admin', 'superAdmin'), validate(getOrdersQuerySchema), getOrders)
router.get('/orders-count', restrictTo('admin', 'superAdmin'), getOrdersCount);

router.delete('/:id', restrictTo('superAdmin'), deleteAdmin);

export default router;
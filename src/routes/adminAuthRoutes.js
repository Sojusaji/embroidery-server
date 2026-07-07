import { Router } from 'express';
import { adminLogin, adminLogout, refresh ,mailGoogleCallback} from '../controllers/auth/adminAuthController.js';
import { validate } from "../middlewares/validate.js";
import { adminLoginSchema } from '../utils/authValidator.js'


const router = Router();

router.post('/login', validate(adminLoginSchema), adminLogin);
router.post('/logout', adminLogout);
router.post('/refresh', refresh)

// THIS CALLBACK IS ONLY FOR GENERATING REFRESH TOKEN FOR SENDING MAIL
router.get('/google/callback',mailGoogleCallback);


export default router;


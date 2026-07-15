import { Router } from "express";
import {
    authStatus,
    verifyUser,
    userLogin,
    register,
    sendOtp,
    userLogout,
    refresh,
    // getGoogleAuthUrl,
    googleCallback
} from "../controllers/auth/userAuthController.js";
import { validate } from "../middlewares/validate.js";
import { userLoginSchema, emailValidationSchema, accountRegistrationSchema } from "../utils/authValidator.js";
import{authMiddleware}from"../middlewares/authMiddleware.js"

const router = Router()

router.get('/auth-status',authMiddleware, authStatus)

router.post('/verify-user',validate(emailValidationSchema) ,verifyUser);

router.post('/login', validate(userLoginSchema), userLogin);

router.post('/register', validate(accountRegistrationSchema), register);

router.post('/send-otp', validate(emailValidationSchema), sendOtp);

router.post('/logout', userLogout);

router.post('/refresh', refresh);

router.post('/google/callback', googleCallback)

// router.get('/google', getGoogleAuthUrl);
export default router;
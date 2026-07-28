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
    googleCallback,
    mailGoogleCallback,
    verifyPin
} from "../controllers/auth/userAuthController.js";
import { validate } from "../middlewares/validate.js";
import { userLoginSchema, emailValidationSchema, accountRegistrationSchema } from "../utils/authValidator.js";
import{authMiddleware}from"../middlewares/authMiddleware.js"

const router = Router()

router.get('/auth-status',authMiddleware, authStatus)

router.post('/verify-user',validate(emailValidationSchema) ,verifyUser);

router.post('/verify-pin',verifyPin)

router.post('/login', validate(userLoginSchema), userLogin);

router.post('/register', validate(accountRegistrationSchema), register);

router.post('/send-otp', validate(emailValidationSchema), sendOtp);

router.post('/logout', userLogout);

router.post('/refresh', refresh);

// router.post('/google/callback', googleCallback)

// THIS CALLBACK IS ONLY FOR GENERATING REFRESH TOKEN FOR SENDING MAIL
router.get('/google/formail-callback',mailGoogleCallback);



// router.get('/google', getGoogleAuthUrl);
export default router;
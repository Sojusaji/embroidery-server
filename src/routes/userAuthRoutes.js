import { Router } from "express";
import { verifyUser, userLogin, register, sendOtp, userLogout } from "../controllers/auth/userAuthController.js";
import { validate } from "../middlewares/validate.js";
import { userLoginSchema,emailValidationSchema, accountRegistrationSchema } from "../utils/authValidator.js";


const router = Router()



router.post('/verify-user',validate(emailValidationSchema), verifyUser);

router.post('/login', validate(userLoginSchema), userLogin);

router.post('/register',validate(accountRegistrationSchema), register);

router.post('/send-otp',validate(emailValidationSchema), sendOtp)

router.post('/logout',userLogout)
export default router;
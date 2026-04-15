import express from "express"
import { forgotPassword, login, logOut, resendSignupOtp, resetPassword, signUp, verifyResetOtp, verifySignupOtp } from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/verify-signup-otp",verifySignupOtp)
authRouter.post("/resend-signup-otp",resendSignupOtp)
authRouter.post("/login",login)
authRouter.post("/logout",logOut)
authRouter.post("/forgot-password",forgotPassword)
authRouter.post("/verify-reset-otp",verifyResetOtp)
authRouter.post("/reset-password",resetPassword)
export default authRouter

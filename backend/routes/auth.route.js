import express from "express"
import { forgotPassword, login, logOut, resetPassword, sighUp, verifyResetOtp } from "../controllers/auth.controller.js"

const authRouter = express.Router()

authRouter.post("/signup",sighUp)
authRouter.post("/login",login)
authRouter.post("/logout",logOut)
authRouter.post("/forgot-password",forgotPassword)
authRouter.post("/verify-reset-otp",verifyResetOtp)
authRouter.post("/reset-password",resetPassword)
export default authRouter

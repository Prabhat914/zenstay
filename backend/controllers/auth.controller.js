import genToken from "../config/token.js"
import User from "../model/user.model.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { hasMailConfig, sendOtpEmail } from "../config/mail.js"
import { hasSmsConfig, sendOtpSms } from "../config/sms.js"
import { isAdminUser } from "../utils/access.js"

const buildCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === "production"
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}
const serializeUser = (userDoc) => {
    const obj = typeof userDoc?.toObject === "function" ? userDoc.toObject() : { ...(userDoc || {}) }
    delete obj.password
    delete obj.phoneOtp
    delete obj.resetPasswordOtp
    delete obj.resetPasswordOtpExpire
    obj.isAdmin = isAdminUser(obj)
    return obj
}
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))
const normalizePhone = (value) => String(value || "").replace(/[^\d+]/g, "").trim()
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const findUserByIdentifier = async (identifier) => {
    const value = String(identifier || "").trim()
    if (!value) return null
    if (value.includes("@")) {
        return User.findOne({ email: value })
    }
    return User.findOne({ phone: normalizePhone(value) })
}

const sendSignupOtp = async ({ email, otp }) => {
    if (hasMailConfig) {
        await sendOtpEmail({
            toEmail: email,
            otp,
            subject: "Zenstay signup verification OTP",
            heading: "Verify your Zenstay account",
            intro: "Use this OTP to complete your signup:"
        })
    }
}

export const signUp=async (req,res) => {
    try {
        let {name,email,phone,password,location,country,mapUrl} = req.body
        email = String(email || "").trim().toLowerCase()
        if (!String(name || "").trim()) {
            return res.status(400).json({message:"Name is required"})
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({message:"Valid email is required"})
        }
        if (!password || String(password).length < 6) {
            return res.status(400).json({message:"Password must be at least 6 characters"})
        }
        let existUser = await User.findOne({email})
        if(existUser?.isVerified){
            return res.status(400).json({message:"User is already exist"})
        }
        const normalizedPhone = normalizePhone(phone)
        if (!normalizedPhone) {
            return res.status(400).json({message:"Phone number is required"})
        }
        let existPhone = await User.findOne({ phone: normalizedPhone })
        if(existPhone && String(existPhone._id) !== String(existUser?._id || "")){
            return res.status(400).json({message:"Phone number is already exist"})
        }
        let hashPassword = await bcrypt.hash(password,10)
        const otp = generateOtp()
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex")
        const payload = {
            name: String(name || "").trim(),
            email,
            phone: normalizedPhone,
            password:hashPassword,
            location: String(location || "").trim(),
            country: String(country || "").trim(),
            mapUrl: String(mapUrl || "").trim(),
            isVerified: false,
            signupOtp: hashedOtp,
            signupOtpExpire: Date.now() + 10 * 60 * 1000
        }

        let user
        if (existUser && !existUser.isVerified) {
            Object.assign(existUser, payload)
            user = await existUser.save()
        } else {
            user = await User.create(payload)
        }

        if (!hasMailConfig && process.env.NODE_ENV === "production") {
            return res.status(500).json({message:"Signup email service is not configured"})
        }

        await sendSignupOtp({ email: user.email, otp })

        const response = {
            message: hasMailConfig ? "Verification OTP sent to your email." : "Verification OTP generated successfully.",
            email: user.email,
            requiresVerification: true
        }
        if (!hasMailConfig) {
            response.otp = otp
        }

        return res.status(201).json(response)

    } catch (error) {
        return res.status(500).json({message:`signup error ${error}`})
    }
    
}
export const login = async (req,res) => {
    try {
        let {email,password} = req.body
        let user= await User.findOne({email}).populate("listing","title image1 image2 image3 description rent category city landMark")
        if(!user){
            return res.status(400).json({message:"User is not exist"})
        }
        if (user.isVerified === false) {
            return res.status(403).json({message:"Please verify your email before logging in"})
        }
        let isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"incorrect Password"})
        }
        let token = await genToken(user._id)
        res.cookie("token",token,buildCookieOptions())
        const safeUser = serializeUser(user)
        return res.status(200).json({ ...safeUser, token })
        
    } catch (error) {
        return res.status(500).json({message:`login error ${error}`})
    }
    
}
export const logOut = async (req,res) => {
    try {
        const options = buildCookieOptions()
        delete options.maxAge
        res.clearCookie("token", options)
        return res.status(200).json({message:"Logout Successfully"})
    } catch (error) {
        return res.status(500).json({message:`logout error ${error}`})
    }
}

export const verifySignupOtp = async (req,res) => {
    try {
        const email = String(req.body?.email || "").trim().toLowerCase()
        const otp = String(req.body?.otp || "").trim()

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" })
        }

        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex")
        const user = await User.findOne({
            email,
            signupOtp: hashedOtp,
            signupOtpExpire: { $gt: Date.now() }
        }).populate("listing","title image1 image2 image3 description rent category city landMark")

        if (!user) {
            return res.status(400).json({ message: "OTP is invalid or expired" })
        }

        user.isVerified = true
        user.signupOtp = undefined
        user.signupOtpExpire = undefined
        await user.save()

        const token = await genToken(user._id)
        res.cookie("token",token,buildCookieOptions())
        const safeUser = serializeUser(user)
        return res.status(200).json({ ...safeUser, token, message: "Signup verified successfully" })
    } catch (error) {
        return res.status(500).json({message:`verify signup otp error ${error}`})
    }
}

export const resendSignupOtp = async (req,res) => {
    try {
        const email = String(req.body?.email || "").trim().toLowerCase()
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        if (user.isVerified !== false) {
            return res.status(400).json({ message: "This account is already verified" })
        }

        const otp = generateOtp()
        user.signupOtp = crypto.createHash("sha256").update(otp).digest("hex")
        user.signupOtpExpire = Date.now() + 10 * 60 * 1000
        await user.save()

        if (!hasMailConfig && process.env.NODE_ENV === "production") {
            return res.status(500).json({ message: "Signup email service is not configured" })
        }

        await sendSignupOtp({ email: user.email, otp })

        const response = {
            message: hasMailConfig ? "Verification OTP resent to your email." : "Verification OTP generated successfully.",
            email: user.email
        }
        if (!hasMailConfig) {
            response.otp = otp
        }

        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({message:`resend signup otp error ${error}`})
    }
}

export const forgotPassword = async (req,res) => {
    try {
        const identifier = String(req.body?.identifier || req.body?.email || req.body?.phone || "").trim()
        if (!identifier) {
            return res.status(400).json({ message: "Email or phone is required" })
        }

        const user = await findUserByIdentifier(identifier)
        if (!user) {
            return res.status(200).json({
                message: "If this email exists, an OTP has been sent."
            })
        }

        const otp = generateOtp()
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex")

        user.resetPasswordOtp = hashedOtp
        user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000
        await user.save()

        const isEmailFlow = Boolean(String(identifier).includes("@"))
        if (isEmailFlow && !hasMailConfig && process.env.NODE_ENV === "production") {
            return res.status(500).json({ message: "OTP email service is not configured" })
        }
        if (!isEmailFlow && !hasSmsConfig && process.env.NODE_ENV === "production") {
            return res.status(500).json({ message: "OTP SMS service is not configured" })
        }

        if (isEmailFlow && hasMailConfig) {
            await sendOtpEmail({ toEmail: user.email, otp })
        }
        if (!isEmailFlow && hasSmsConfig) {
            await sendOtpSms({ toPhone: user.phone, otp })
        }

        const response = {
            message: isEmailFlow
                ? (hasMailConfig ? "OTP sent to your email." : "OTP generated successfully.")
                : (hasSmsConfig ? "OTP sent to your phone." : "OTP generated successfully."),
            identifier: isEmailFlow ? user.email : user.phone
        }
        if ((isEmailFlow && !hasMailConfig) || (!isEmailFlow && !hasSmsConfig)) {
            response.otp = otp
        }

        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({message:`forgot password error ${error}`})
    }
}

export const verifyResetOtp = async (req,res) => {
    try {
        const identifier = String(req.body?.identifier || req.body?.email || req.body?.phone || "").trim()
        const { otp } = req.body

        if (!identifier || !otp) {
            return res.status(400).json({ message: "Email or phone and OTP are required" })
        }

        const hashedOtp = crypto.createHash("sha256").update(String(otp)).digest("hex")
        const user = await User.findOne({
            ...(identifier.includes("@") ? { email: identifier } : { phone: normalizePhone(identifier) }),
            resetPasswordOtp: hashedOtp,
            resetPasswordOtpExpire: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ message: "OTP is invalid or expired" })
        }

        return res.status(200).json({ message: "OTP verified successfully" })
    } catch (error) {
        return res.status(500).json({message:`verify otp error ${error}`})
    }
}

export const resetPassword = async (req,res) => {
    try {
        const identifier = String(req.body?.identifier || req.body?.email || req.body?.phone || "").trim()
        const { otp, password, confirmPassword } = req.body

        if (!identifier || !otp) {
            return res.status(400).json({ message: "Email or phone and OTP are required" })
        }

        if (!password || !confirmPassword) {
            return res.status(400).json({ message: "Password and confirm password are required" })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const hashedOtp = crypto.createHash("sha256").update(String(otp)).digest("hex")
        const user = await User.findOne({
            ...(identifier.includes("@") ? { email: identifier } : { phone: normalizePhone(identifier) }),
            resetPasswordOtp: hashedOtp,
            resetPasswordOtpExpire: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ message: "OTP is invalid or expired" })
        }

        const hashPassword = await bcrypt.hash(password,10)
        user.password = hashPassword
        user.resetPasswordOtp = undefined
        user.resetPasswordOtpExpire = undefined
        await user.save()

        return res.status(200).json({ message: "Password reset successful" })
    } catch (error) {
        return res.status(500).json({message:`reset password error ${error}`})
    }
}

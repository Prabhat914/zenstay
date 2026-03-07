import genToken from "../config/token.js"
import User from "../model/user.model.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { hasMailConfig, sendOtpEmail } from "../config/mail.js"
import { hasSmsConfig, sendOtpSms } from "../config/sms.js"

const buildCookieOptions = () => {
    const isProduction = process.env.NODE_ENVIRONMENT === "production"
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
    return obj
}
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))
const normalizePhone = (value) => String(value || "").replace(/[^\d+]/g, "").trim()
const findUserByIdentifier = async (identifier) => {
    const value = String(identifier || "").trim()
    if (!value) return null
    if (value.includes("@")) {
        return User.findOne({ email: value })
    }
    return User.findOne({ phone: normalizePhone(value) })
}

export const sighUp=async (req,res) => {
    try {
        let {name,email,phone,password,location,country,mapUrl} = req.body
        let existUser = await User.findOne({email})
        if(existUser){
            return res.status(400).json({message:"User is already exist"})
        }
        const normalizedPhone = normalizePhone(phone)
        if (!normalizedPhone) {
            return res.status(400).json({message:"Phone number is required"})
        }
        let existPhone = await User.findOne({ phone: normalizedPhone })
        if(existPhone){
            return res.status(400).json({message:"Phone number is already exist"})
        }
        let hashPassword = await bcrypt.hash(password,10)
        let user = await User.create({
            name,
            email,
            phone: normalizedPhone,
            password:hashPassword,
            location: String(location || "").trim(),
            country: String(country || "").trim(),
            mapUrl: String(mapUrl || "").trim()
        })
        let token = await genToken(user._id)
        res.cookie("token",token,buildCookieOptions())
        const safeUser = serializeUser(user)
        return res.status(201).json({ ...safeUser, token })

    } catch (error) {
        return res.status(500).json({message:`sighup error ${error}`})
    }
    
}
export const login = async (req,res) => {
    try {
        let {email,password} = req.body
        let user= await User.findOne({email}).populate("listing","title image1 image2 image3 description rent category city landMark")
        if(!user){
            return res.status(400).json({message:"User is not exist"})
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
        res.clearCookie("token", buildCookieOptions())
        return res.status(200).json({message:"Logout Successfully"})
    } catch (error) {
        return res.status(500).json({message:`logout error ${error}`})
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
        if (isEmailFlow && !hasMailConfig && process.env.NODE_ENVIRONMENT === "production") {
            return res.status(500).json({ message: "OTP email service is not configured" })
        }
        if (!isEmailFlow && !hasSmsConfig && process.env.NODE_ENVIRONMENT === "production") {
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

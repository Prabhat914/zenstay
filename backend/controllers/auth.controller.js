import genToken from "../config/token.js"
import User from "../model/user.model.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"

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
    delete obj.resetPasswordOtp
    delete obj.resetPasswordOtpExpire
    return obj
}
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))

export const sighUp=async (req,res) => {
    try {
        let {name,email,password,location,country,mapUrl} = req.body
        let existUser = await User.findOne({email})
        if(existUser){
            return res.status(400).json({message:"User is already exist"})
        }
        let hashPassword = await bcrypt.hash(password,10)
        let user = await User.create({
            name,
            email,
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
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(200).json({
                message: "If this email exists, an OTP has been generated."
            })
        }

        const otp = generateOtp()
        const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex")

        user.resetPasswordOtp = hashedOtp
        user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000
        await user.save()

        const response = {
            message: "OTP generated successfully.",
            email: user.email,
            otp
        }

        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({message:`forgot password error ${error}`})
    }
}

export const resetPassword = async (req,res) => {
    try {
        const { email, otp, password, confirmPassword } = req.body

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" })
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
            email,
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

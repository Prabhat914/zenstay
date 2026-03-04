import genToken from "../config/token.js"
import User from "../model/user.model.js"
import bcrypt from "bcryptjs"
import crypto from "crypto"

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
        res.cookie("token",token,{
            httpOnly:true,
            secure: process.env.NODE_ENVIRONMENT === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000


        })
        return res.status(201).json(user)

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
        res.cookie("token",token,{
            httpOnly:true,
            secure: process.env.NODE_ENVIRONMENT === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000


        })
        return res.status(200).json(user)
        
    } catch (error) {
        return res.status(500).json({message:`login error ${error}`})
    }
    
}
export const logOut = async (req,res) => {
    try {
        res.clearCookie("token")
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
                message: "If this email exists, reset instructions have been generated."
            })
        }

        const resetToken = crypto.randomBytes(32).toString("hex")
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

        user.resetPasswordToken = hashedToken
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000
        await user.save()

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`

        const response = { message: "Password reset link generated." }
        if (process.env.NODE_ENVIRONMENT !== "production") {
            response.resetUrl = resetUrl
        }

        return res.status(200).json(response)
    } catch (error) {
        return res.status(500).json({message:`forgot password error ${error}`})
    }
}

export const resetPassword = async (req,res) => {
    try {
        const { token } = req.params
        const { password, confirmPassword } = req.body

        if (!password || !confirmPassword) {
            return res.status(400).json({ message: "Password and confirm password are required" })
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ message: "Reset token is invalid or expired" })
        }

        const hashPassword = await bcrypt.hash(password,10)
        user.password = hashPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()

        return res.status(200).json({ message: "Password reset successful" })
    } catch (error) {
        return res.status(500).json({message:`reset password error ${error}`})
    }
}

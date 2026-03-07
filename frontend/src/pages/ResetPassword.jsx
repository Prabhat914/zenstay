import React, { useContext, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import axios from 'axios';
import { authDataContext } from '../Context/AuthContext';
import { toast } from 'react-toastify';

function ResetPassword() {
    let navigate = useNavigate()
    let [searchParams] = useSearchParams()
    let {serverUrl} = useContext(authDataContext)
    let [show,setShow] = useState(false)
    let [showConfirm,setShowConfirm] = useState(false)
    let [identifier,setIdentifier]= useState(searchParams.get("identifier") || "")
    let [otp,setOtp]= useState("")
    let [password,setPassword]= useState("")
    let [confirmPassword,setConfirmPassword]= useState("")
    let [loading,setLoading]= useState(false)
    let [otpVerified,setOtpVerified]= useState(false)

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await axios.post(serverUrl + `/api/auth/verify-reset-otp`, {
                identifier,
                otp
            })
            setLoading(false)
            setOtpVerified(true)
            toast.success(result.data?.message || "OTP verified successfully")
        } catch (error) {
            setLoading(false)
            setOtpVerified(false)
            toast.error(error?.response?.data?.message || "Unable to verify OTP")
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await axios.post(serverUrl + `/api/auth/reset-password`, {
                identifier,
                otp,
                password,
                confirmPassword
            })
            setLoading(false)
            toast.success(result.data?.message || "Password reset successful")
            navigate("/login")
        } catch (error) {
            setLoading(false)
            toast.error(error?.response?.data?.message || "Unable to reset password")
        }
    }

    return (
        <div className='w-[100vw] h-[100vh] flex items-center justify-center relative'>
            <div className='w-[50px] h-[50px] bg-[var(--zenstay-accent)] cursor-pointer absolute top-[10%] left-[20px] rounded-[50%] flex items-center justify-center' onClick={()=>navigate("/login")}><FaArrowLeftLong className='w-[25px] h-[25px] text-[white]' /></div>
            <form className='max-w-[900px] w-[90%] h-[600px] flex items-center justify-center flex-col md:items-start gap-[10px]' onSubmit={otpVerified ? handleResetPassword : handleVerifyOtp}>
                <h1 className='text-[30px] text-[black]'>Reset Password</h1>
                <p className='text-[16px] text-[#555]'>{otpVerified ? "Set your new password below." : "First verify the OTP sent to your email."}</p>
                <div className='w-[90%] flex items-start justify-start flex-col gap-[10px] mt-[20px]'>
                    <label htmlFor="identifier" className='text-[20px]'>Email or Phone</label>
                    <input type="text" id='identifier' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required onChange={(e)=>setIdentifier(e.target.value)} value={identifier} disabled={otpVerified}/>
                </div>
                <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
                    <label htmlFor="otp" className='text-[20px]'>OTP</label>
                    <input type="text" id='otp' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px] tracking-[0.35em]' required maxLength={6} onChange={(e)=>setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} value={otp} disabled={otpVerified}/>
                </div>
                {otpVerified && <div className='w-[90%] flex items-start justify-start flex-col gap-[10px] mt-[20px] relative'>
                    <label htmlFor="password" className='text-[20px]'>New Password</label>
                    <input type={show?"text":"password"} id='password' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required minLength={6} onChange={(e)=>setPassword(e.target.value)} value={password}/>
                    {!show && <IoMdEye className='w-[22px] h-[22px] absolute right-[12%] bottom-[10px] cursor-pointer' onClick={()=>setShow(true)}/>}
                    {show && <IoMdEyeOff className='w-[22px] h-[22px] absolute right-[12%] bottom-[10px] cursor-pointer' onClick={()=>setShow(false)}/>}
                </div>}
                {otpVerified && <div className='w-[90%] flex items-start justify-start flex-col gap-[10px] relative'>
                    <label htmlFor="confirmPassword" className='text-[20px]'>Confirm Password</label>
                    <input type={showConfirm?"text":"password"} id='confirmPassword' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required minLength={6} onChange={(e)=>setConfirmPassword(e.target.value)} value={confirmPassword}/>
                    {!showConfirm && <IoMdEye className='w-[22px] h-[22px] absolute right-[12%] bottom-[10px] cursor-pointer' onClick={()=>setShowConfirm(true)}/>}
                    {showConfirm && <IoMdEyeOff className='w-[22px] h-[22px] absolute right-[12%] bottom-[10px] cursor-pointer' onClick={()=>setShowConfirm(false)}/>}
                </div>}
                <button className='px-[50px] py-[10px] bg-[var(--zenstay-accent)] text-[white] text-[18px] md:px-[100px] rounded-lg mt-[20px] hover:bg-[var(--zenstay-accent-dark)] transition-colors' disabled={loading}>
                    {loading ? "Loading..." : otpVerified ? "Reset Password" : "Verify OTP"}
                </button>
            </form>
        </div>
    )
}

export default ResetPassword

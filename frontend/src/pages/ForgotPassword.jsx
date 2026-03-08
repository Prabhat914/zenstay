import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeftLong } from "react-icons/fa6";
import axios from 'axios';
import { authDataContext } from '../Context/AuthContext';
import { toast } from 'react-toastify';

const AUTH_REQUEST_TIMEOUT = 10000

function ForgotPassword() {
    let navigate = useNavigate()
    let {serverUrl} = useContext(authDataContext)
    let [identifier,setIdentifier]= useState("")
    let [loading,setLoading]= useState(false)

    const isOtpResponse = (data) => {
        const message = String(data?.message || "").toLowerCase()
        return Boolean(data?.identifier) || message.includes("otp")
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const normalizedIdentifier = String(identifier || "").trim()
            const requestBody = { identifier: normalizedIdentifier }
            if (normalizedIdentifier.includes("@")) {
                requestBody.email = normalizedIdentifier
            } else {
                requestBody.phone = normalizedIdentifier
            }
            const result = await axios.post(serverUrl + "/api/auth/forgot-password", requestBody, {
                timeout: AUTH_REQUEST_TIMEOUT
            })
            if (!isOtpResponse(result.data)) {
                throw new Error("Legacy password reset response received. OTP backend is not deployed yet.")
            }
            setLoading(false)
            toast.success(result.data?.message || "OTP sent successfully")
            if (result.data?.otp) {
                toast.info(`Dev OTP: ${result.data.otp}`)
            }
            navigate(`/reset-password?identifier=${encodeURIComponent(normalizedIdentifier)}`)
        } catch (error) {
            setLoading(false)
            const isTimeout = error?.code === "ECONNABORTED"
            const legacyMessage = String(error?.response?.data?.message || error?.message || "")
            const isLegacyFlow = legacyMessage.toLowerCase().includes("reset link")
            toast.error(
                isTimeout
                    ? "Forgot password request timed out. Backend is slow or unavailable."
                    : isLegacyFlow
                    ? "OTP flow is not live on the backend yet. Deploy the latest backend and email config."
                    : legacyMessage || "Unable to process request"
            )
        }
    }

    return (
        <div className='w-[100vw] h-[100vh] flex items-center justify-center relative'>
            <div className='w-[50px] h-[50px] bg-[var(--zenstay-accent)] cursor-pointer absolute top-[10%] left-[20px] rounded-[50%] flex items-center justify-center' onClick={()=>navigate("/login")}><FaArrowLeftLong className='w-[25px] h-[25px] text-[white]' /></div>
            <form className='max-w-[900px] w-[90%] h-[600px] flex items-center justify-center flex-col md:items-start gap-[12px]' onSubmit={handleForgotPassword}>
                <h1 className='text-[30px] text-[black]'>Forgot Password</h1>
                <p className='text-[16px] text-[#555]'>Enter your account email or phone number to receive a reset OTP.</p>
                <div className='w-[90%] flex items-start justify-start flex-col gap-[10px] mt-[20px]'>
                    <label htmlFor="identifier" className='text-[20px]'>Email or Phone</label>
                    <input type="text" id='identifier' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required onChange={(e)=>setIdentifier(e.target.value)} value={identifier}/>
                </div>
                <button className='px-[50px] py-[10px] bg-[var(--zenstay-accent)] text-[white] text-[18px] md:px-[100px] rounded-lg mt-[20px] hover:bg-[var(--zenstay-accent-dark)] transition-colors' disabled={loading}>{loading ? "Loading..." : "Continue"}</button>
            </form>
        </div>
    )
}

export default ForgotPassword

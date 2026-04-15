import React, { useContext, useState } from 'react'
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeftLong } from "react-icons/fa6";
import axios from 'axios';
import { authDataContext } from '../Context/AuthContext';
import { userDataContext } from '../Context/UserContext';
import { toast } from 'react-toastify';

const AUTH_REQUEST_TIMEOUT = 10000

function SignUp() {
    let [show,setShow] = useState(false)
    let [showOtp,setShowOtp] = useState(false)
    let navigate = useNavigate()
    let {serverUrl,setAuthToken} = useContext(authDataContext)
    let {userData,setUserData} = useContext(userDataContext)
    let [name,setName]= useState("")
    let [email,setEmail]= useState("")
    let [phone,setPhone]= useState("")
    let [location,setLocation]= useState("")
    let [country,setCountry]= useState("")
    let [password,setPassword]= useState("")
    let [otp,setOtp]= useState("")
    let [pendingEmail,setPendingEmail]= useState("")
    let {loading,setLoading}= useContext(authDataContext)
    const mapQuery = [location, country].filter(Boolean).join(", ").trim()
    const mapUrl = mapQuery
      ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
      : ""



    const handleSignUP = async (e) => {
        e.preventDefault()
        if (!serverUrl) {
          toast.error("API URL is missing. Set VITE_API_URL in deployment environment.")
          return
        }
        setLoading(true)
        try {
            let result = await axios.post(serverUrl + "/api/auth/signup",{
                name,
                email,
                phone,
                location,
                country,
                mapUrl,
                password

            },{withCredentials:true, timeout: AUTH_REQUEST_TIMEOUT})
            setLoading(false)
            setPendingEmail(result?.data?.email || email)
            setShowOtp(true)
            toast.success(result?.data?.message || "Verification OTP sent")
            if (result?.data?.otp) {
              toast.info(`Dev OTP: ${result.data.otp}`)
            }
            console.log(result)
        } catch (error) {
          setLoading(false)
            console.log(error)
            const message = error?.code === "ECONNABORTED"
              ? "Signup request timed out. Backend is slow or unavailable."
              : error?.response?.data?.message || error?.message || "Something went wrong"
            toast.error(message)
        }
        
    }

    const handleVerifyOtp = async (e) => {
      e.preventDefault()
      setLoading(true)
      try {
        const result = await axios.post(serverUrl + "/api/auth/verify-signup-otp", {
          email: pendingEmail || email,
          otp
        }, { withCredentials: true, timeout: AUTH_REQUEST_TIMEOUT })

        const token = result?.data?.token || ""
        const { token: _token, ...userPayload } = result?.data || {}
        setUserData(userPayload)
        setAuthToken(token)
        localStorage.setItem("zenstay_user", JSON.stringify(userPayload))
        if (token) {
          localStorage.setItem("zenstay_token", token)
        }
        setLoading(false)
        toast.success(result?.data?.message || "Signup verified successfully")
        navigate("/")
      } catch (error) {
        setLoading(false)
        toast.error(
          error?.code === "ECONNABORTED"
            ? "OTP verification timed out. Backend is slow or unavailable."
            : error?.response?.data?.message || "Unable to verify signup OTP"
        )
      }
    }

    const handleResendOtp = async () => {
      setLoading(true)
      try {
        const result = await axios.post(serverUrl + "/api/auth/resend-signup-otp", {
          email: pendingEmail || email
        }, { withCredentials: true, timeout: AUTH_REQUEST_TIMEOUT })
        setLoading(false)
        toast.success(result?.data?.message || "OTP resent successfully")
        if (result?.data?.otp) {
          toast.info(`Dev OTP: ${result.data.otp}`)
        }
      } catch (error) {
        setLoading(false)
        toast.error(error?.response?.data?.message || "Unable to resend OTP")
      }
    }

    const featurePoints = [
      "Email OTP verification for new accounts",
      "Location preview before account creation",
      "Fast host + guest onboarding flow"
    ]

  return (
    <div className='min-h-screen bg-[linear-gradient(180deg,#eef8f8_0%,#ffffff_34%,#f6f7fb_100%)] px-[16px] py-[24px] md:px-[28px]'>
        <div className='max-w-[1180px] mx-auto flex items-center justify-between mb-[18px]'>
          <div className='w-[50px] h-[50px] bg-[var(--zenstay-accent)] cursor-pointer rounded-[50%] flex items-center justify-center shadow-[0_10px_30px_var(--zenstay-accent-shadow)]' onClick={()=>navigate("/")}><FaArrowLeftLong className='w-[25px] h-[25px] text-[white]' /></div>
          <button className='text-[15px] text-[#29575a] underline-offset-4 hover:underline' onClick={()=>navigate("/login")}>Already have an account?</button>
        </div>

        <div className='max-w-[1180px] mx-auto grid grid-cols-1 gap-[20px] lg:grid-cols-[0.92fr_1.08fr]'>
          <div className='rounded-[32px] bg-[#123b3d] text-white p-[24px] md:p-[34px] shadow-[0_24px_60px_rgba(18,59,61,0.24)] flex flex-col justify-between min-h-[280px] lg:min-h-[720px]'>
            <div>
              <div className='inline-flex items-center rounded-full bg-white/12 px-[14px] py-[8px] text-[13px] tracking-[0.18em] uppercase'>Zenstay Access</div>
              <h1 className='text-[32px] leading-[1.1] font-semibold mt-[18px] md:text-[48px]'>Create your account and verify it with email OTP.</h1>
              <p className='text-[16px] text-white/78 mt-[18px] max-w-[420px]'>Hosts and guests both start here. Add your details once, verify your email, and enter the booking flow without guesswork.</p>
            </div>

            <div className='grid grid-cols-1 gap-[12px] mt-[28px]'>
              {featurePoints.map((point) => (
                <div key={point} className='rounded-[18px] border border-white/12 bg-white/8 px-[16px] py-[14px] text-[15px] text-white/90'>
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className='rounded-[32px] border border-[#d8e7e8] bg-white/92 backdrop-blur-sm shadow-[0_20px_60px_rgba(15,23,42,0.08)] overflow-hidden'>
            <div className='px-[20px] pt-[22px] md:px-[34px] md:pt-[30px]'>
              <div className='flex flex-wrap items-center gap-[10px]'>
                <div className={`px-[14px] py-[8px] rounded-full text-[14px] ${!showOtp ? "bg-[var(--zenstay-accent)] text-white" : "bg-[#eef6f6] text-[#47686a]"}`}>1. Details</div>
                <div className={`px-[14px] py-[8px] rounded-full text-[14px] ${showOtp ? "bg-[var(--zenstay-accent)] text-white" : "bg-[#eef6f6] text-[#47686a]"}`}>2. Verify OTP</div>
              </div>
            </div>

            {!showOtp && (
              <form className='px-[20px] py-[22px] md:px-[34px] md:py-[30px] flex flex-col gap-[16px]' onSubmit={handleSignUP}>
                <div>
                  <h2 className='text-[30px] text-[#15282a] font-semibold'>Welcome to Zenstay</h2>
                  <p className='text-[15px] text-[#627779] mt-[8px]'>Fill in your details and we’ll send a verification code to your email.</p>
                </div>

                <div className='grid grid-cols-1 gap-[14px] md:grid-cols-2'>
                  <div className='flex flex-col gap-[8px]'>
                    <label htmlFor="name" className='text-[15px] text-[#254345] font-medium'>User Name</label>
                    <input type="text" id='name' className='h-[48px] border border-[#cbd7d8] rounded-[16px] text-[16px] px-[16px] outline-none focus:border-[var(--zenstay-accent)]' required onChange={(e)=>setName(e.target.value)} value={name}/>
                  </div>
                  <div className='flex flex-col gap-[8px]'>
                    <label htmlFor="email" className='text-[15px] text-[#254345] font-medium'>Email</label>
                    <input type="email" id='email' className='h-[48px] border border-[#cbd7d8] rounded-[16px] text-[16px] px-[16px] outline-none focus:border-[var(--zenstay-accent)]' required onChange={(e)=>setEmail(e.target.value)} value={email}/>
                  </div>
                  <div className='flex flex-col gap-[8px]'>
                    <label htmlFor="phone" className='text-[15px] text-[#254345] font-medium'>Phone Number</label>
                    <input type="text" id='phone' className='h-[48px] border border-[#cbd7d8] rounded-[16px] text-[16px] px-[16px] outline-none focus:border-[var(--zenstay-accent)]' required onChange={(e)=>setPhone(e.target.value)} value={phone}/>
                  </div>
                  <div className='flex flex-col gap-[8px]'>
                    <label htmlFor="password" className='text-[15px] text-[#254345] font-medium'>Password</label>
                    <div className='relative'>
                      <input type={show?"text":"password"} id='password' className='w-full h-[48px] border border-[#cbd7d8] rounded-[16px] text-[16px] px-[16px] pr-[48px] outline-none focus:border-[var(--zenstay-accent)]' required onChange={(e)=>setPassword(e.target.value)} value={password} />
                      {!show && <IoMdEye className='w-[22px] h-[22px] absolute right-[16px] bottom-[13px] cursor-pointer text-[#607173]' onClick={()=>setShow(true)}/>}
                      {show && <IoMdEyeOff className='w-[22px] h-[22px] absolute right-[16px] bottom-[13px] cursor-pointer text-[#607173]' onClick={()=>setShow(false)}/>}
                    </div>
                  </div>
                  <div className='flex flex-col gap-[8px]'>
                    <label htmlFor="location" className='text-[15px] text-[#254345] font-medium'>Location</label>
                    <input type="text" id='location' className='h-[48px] border border-[#cbd7d8] rounded-[16px] text-[16px] px-[16px] outline-none focus:border-[var(--zenstay-accent)]' required onChange={(e)=>setLocation(e.target.value)} value={location}/>
                  </div>
                  <div className='flex flex-col gap-[8px]'>
                    <label htmlFor="country" className='text-[15px] text-[#254345] font-medium'>Country</label>
                    <input type="text" id='country' className='h-[48px] border border-[#cbd7d8] rounded-[16px] text-[16px] px-[16px] outline-none focus:border-[var(--zenstay-accent)]' required onChange={(e)=>setCountry(e.target.value)} value={country}/>
                  </div>
                </div>

                {mapUrl && (
                  <div className='rounded-[22px] border border-[#d7e4e5] bg-[#f9fbfb] p-[14px] md:p-[18px]'>
                    <div className='flex items-center justify-between gap-[10px] mb-[10px]'>
                      <label className='text-[15px] text-[#254345] font-medium'>Map Preview</label>
                      <span className='text-[13px] text-[#5e7476]'>{location}, {country}</span>
                    </div>
                    <iframe
                      title="location-map-preview"
                      src={mapUrl}
                      className='w-full h-[220px] md:h-[260px] border border-[#d0dddd] rounded-[18px]'
                      loading='lazy'
                      referrerPolicy='no-referrer-when-downgrade'
                    />
                  </div>
                )}

                <div className='flex flex-col gap-[12px] pt-[6px]'>
                  <button className='w-full md:w-fit px-[28px] py-[14px] bg-[var(--zenstay-accent)] text-[white] text-[17px] rounded-[18px] hover:bg-[var(--zenstay-accent-dark)] transition-colors' disabled={loading}>{loading?"Sending OTP...":"Continue with Email OTP"}</button>
                  <div className='flex flex-wrap items-center justify-between gap-[10px] text-[15px]'>
                    <p className='text-[#627779] cursor-pointer hover:text-[var(--zenstay-accent)]' onClick={()=>navigate("/forgot-password")}>Forgot Password?</p>
                    <p className='text-[#42595b]'>Already have an account? <span className='text-[var(--zenstay-accent)] cursor-pointer font-medium' onClick={()=>navigate("/login")}>Login</span></p>
                  </div>
                </div>
              </form>
            )}

            {showOtp && (
              <form className='px-[20px] py-[22px] md:px-[34px] md:py-[30px] flex flex-col gap-[16px]' onSubmit={handleVerifyOtp}>
                <div>
                  <h2 className='text-[30px] text-[#15282a] font-semibold'>Verify your email</h2>
                  <p className='text-[15px] text-[#627779] mt-[8px]'>We sent a 6-digit OTP to <span className='font-medium text-[#123b3d]'>{pendingEmail || email}</span>.</p>
                </div>

                <div className='rounded-[22px] bg-[#f3fbfb] border border-[#d8e7e8] p-[18px] flex flex-col gap-[12px]'>
                  <label htmlFor="otp" className='text-[15px] text-[#254345] font-medium'>Enter OTP</label>
                  <input
                    type="text"
                    id='otp'
                    className='h-[54px] border border-[#cbd7d8] rounded-[16px] text-[24px] tracking-[0.45em] text-center px-[16px] outline-none focus:border-[var(--zenstay-accent)]'
                    required
                    maxLength={6}
                    onChange={(e)=>setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    value={otp}
                  />
                  <p className='text-[14px] text-[#5f7274]'>OTP valid for 10 minutes. Check spam/junk folder if it doesn’t appear in inbox.</p>
                </div>

                <div className='flex flex-col gap-[12px] md:flex-row'>
                  <button className='w-full md:w-fit px-[28px] py-[14px] bg-[var(--zenstay-accent)] text-[white] text-[17px] rounded-[18px] hover:bg-[var(--zenstay-accent-dark)] transition-colors' disabled={loading}>{loading?"Verifying...":"Verify and Create Account"}</button>
                  <button type="button" className='w-full md:w-fit px-[28px] py-[14px] rounded-[18px] border border-[#cfe0e1] text-[#244345] bg-white hover:bg-[#f6fbfb]' onClick={handleResendOtp} disabled={loading}>Resend OTP</button>
                </div>

                <div className='flex flex-wrap items-center justify-between gap-[10px] text-[15px]'>
                  <button type="button" className='text-[#627779] hover:text-[var(--zenstay-accent)]' onClick={()=>setShowOtp(false)}>Edit signup details</button>
                  <p className='text-[#42595b]'>Already verified? <span className='text-[var(--zenstay-accent)] cursor-pointer font-medium' onClick={()=>navigate("/login")}>Login</span></p>
                </div>
              </form>
            )}
          </div>
        </div>
    </div>
  )
}

export default SignUp

import React, { useContext, useState } from 'react'
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeftLong } from "react-icons/fa6";
import axios from 'axios';
import { authDataContext } from '../Context/AuthContext';
import { userDataContext } from '../Context/UserContext';
import { toast } from 'react-toastify';

function SignUp() {
    let [show,setShow] = useState(false)
    let navigate = useNavigate()
    let {serverUrl,setAuthToken} = useContext(authDataContext)
    let {userData,setUserData} = useContext(userDataContext)
    let [name,setName]= useState("")
    let [email,setEmail]= useState("")
    let [location,setLocation]= useState("")
    let [country,setCountry]= useState("")
    let [password,setPassword]= useState("")
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
                location,
                country,
                mapUrl,
                password

            },{withCredentials:true})
            setLoading(false)
            const token = result?.data?.token || ""
            const { token: _token, ...userPayload } = result?.data || {}
            setUserData(userPayload)
            setAuthToken(token)
            if (token) {
              localStorage.setItem("zenstay_token", token)
            }
            navigate("/")
            toast.success("Signup Successfully")
            console.log(result)
        } catch (error) {
          setLoading(false)
            console.log(error)
            const message = error?.response?.data?.message || error?.message || "Something went wrong"
            toast.error(message)
        }
        
    }
  return (
    <div className='w-[100vw] h-[100vh] flex items-center justify-center relative'>
        <div className='w-[50px] h-[50px] bg-[var(--zenstay-accent)] cursor-pointer absolute top-[10%] left-[20px] rounded-[50%] flex items-center justify-center' onClick={()=>navigate("/")}><FaArrowLeftLong className='w-[25px] h-[25px] text-[white]' /></div>
        <form action="" className='max-w-[900px] w-[90%] h-[600px] overflow-auto py-[10px] flex items-center justify-center flex-col md:items-start gap-[10px]' onSubmit={handleSignUP}>
            <h1 className='text-[30px] text-[black]'>Welcome to Zenstay</h1>
            <div className='w-[90%] flex items-start justify-start flex-col gap-[10px] mt-[30px] '>
          <label htmlFor="name" className='text-[20px]'>UserName</label>
          <input type="text" id='name' className='w-[90%] h-[40px] border-[2px] border-[#555656]  rounded-lg text-[18px] px-[20px] ' required onChange={(e)=>setName(e.target.value)} value={name}/>
          </div> 
          <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
          <label htmlFor="email" className='text-[20px]'>Email</label>
          <input type="text" id='email' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required onChange={(e)=>setEmail(e.target.value)} value={email}/>
          </div> 
          <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
          <label htmlFor="location" className='text-[20px]'>Location</label>
          <input type="text" id='location' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required onChange={(e)=>setLocation(e.target.value)} value={location}/>
          </div> 
          <div className='w-[90%] flex items-start justify-start flex-col gap-[10px]'>
          <label htmlFor="country" className='text-[20px]'>Country</label>
          <input type="text" id='country' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px]' required onChange={(e)=>setCountry(e.target.value)} value={country}/>
          </div> 
          <div className='w-[90%] flex items-start justify-start flex-col gap-[10px] relative  '>
          <label htmlFor="password" className='text-[20px]'>Password</label>
          <input type={show?"text":"password"} id='password' className='w-[90%] h-[40px] border-[2px] border-[#555656] rounded-lg text-[18px] px-[20px] ' required onChange={(e)=>setPassword(e.target.value)} value={password} />
          {!show && <IoMdEye className='w-[22px] h-[22px] absolute right-[12%] bottom-[10px] cursor-pointer' onClick={()=>setShow(prev =>!prev)}/>}
          {show && <IoMdEyeOff className='w-[22px] h-[22px] absolute right-[12%] bottom-[10px] cursor-pointer' onClick={()=>setShow(prev =>!prev)}/>}
          </div>
          {mapUrl && (
            <div className='w-[90%] flex items-start justify-start flex-col gap-[8px] mt-[10px]'>
              <label className='text-[20px]'>Map Preview</label>
              <iframe
                title="location-map-preview"
                src={mapUrl}
                className='w-[90%] h-[220px] border-[2px] border-[#555656] rounded-lg'
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              />
            </div>
          )}
          <p className='w-[90%] text-[16px] text-[var(--zenstay-accent)] cursor-pointer' onClick={()=>navigate("/forgot-password")}>Forgot Password?</p>
          <button className='px-[50px] py-[10px] bg-[var(--zenstay-accent)] text-[white] text-[18px] md:px-[100px] rounded-lg mt-[20px] hover:bg-[var(--zenstay-accent-dark)] transition-colors' disabled={loading}>{loading?"Loading...":"SignUp"}</button>
          <p className='text-[18px]'>Already have a account? <span className='text-[19px] text-[var(--zenstay-accent)] cursor-pointer' onClick={()=>navigate("/login")}>Login</span>
          </p>
        </form>
     
    </div>
  )
}

export default SignUp

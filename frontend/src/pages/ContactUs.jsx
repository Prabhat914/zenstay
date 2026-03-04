import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { authDataContext } from '../Context/AuthContext'

function ContactUs() {
  const { serverUrl } = useContext(authDataContext)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/contact`, {
        name, email, subject, message
      })
      toast.success(result?.data?.message || "Message sent")
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
    } catch (error) {
      if (!error?.response) {
        toast.error("Unable to submit contact form. Backend server is not reachable.")
      } else {
        toast.error(error?.response?.data?.message || "Unable to submit contact form")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-[100vw] min-h-[100vh] bg-white px-[20px] py-[30px] md:px-[60px]'>
      <h1 className='text-[30px] text-black font-semibold'>Contact Us</h1>
      <div className='text-[17px] text-[#333] mt-[18px] max-w-[900px] flex flex-col gap-[8px]'>
        <p>Email: support@zenstay.com</p>
        <p>Phone: +91 90000 00000</p>
        <p>Address: Zenstay, India</p>
      </div>
      <form onSubmit={handleSubmit} className='max-w-[700px] mt-[28px] flex flex-col gap-[12px]'>
        <input
          type="text"
          placeholder='Your Name'
          className='h-[42px] border border-[#bbb] rounded-md px-[12px]'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder='Your Email'
          className='h-[42px] border border-[#bbb] rounded-md px-[12px]'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder='Subject (optional)'
          className='h-[42px] border border-[#bbb] rounded-md px-[12px]'
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          placeholder='Your Message'
          className='min-h-[130px] border border-[#bbb] rounded-md px-[12px] py-[10px]'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button
          type="submit"
          className='w-fit px-[30px] py-[10px] rounded-md bg-[red] text-white'
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
      <Link to="/" className='inline-block mt-[30px] text-[red] text-[18px]'>Back to Home</Link>
    </div>
  )
}

export default ContactUs

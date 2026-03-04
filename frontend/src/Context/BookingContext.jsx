import axios from 'axios'
import React, { createContext, useContext, useState } from 'react'
import { authDataContext } from './AuthContext'
import { userDataContext } from './UserContext'
import { listingDataContext } from './ListingContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify';
export const bookingDataContext= createContext()
function BookingContext({children}) {
    let [checkIn,setCheckIn]=useState("")
    let [checkOut,setCheckOut]=useState("")
    let [total,setTotal]=useState(0)
    let [night,setNight]=useState(0)
    let {serverUrl} = useContext(authDataContext)
    let {getCurrentUser,userData} = useContext(userDataContext)
    let {getListing} = useContext(listingDataContext)
    let [bookingData,setBookingData]= useState([])
    let [myBookings,setMyBookings]= useState([])
    let [booking,setbooking]= useState(false)
    let navigate = useNavigate()

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) return resolve(true)
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleBooking = async (id) => {
        setbooking(true)
        try {
            if (!checkIn || !checkOut || Number(total) <= 0) {
                setbooking(false)
                return toast.error("Please select valid check-in/check-out dates")
            }

            let orderResult
            try {
                orderResult = await axios.post(serverUrl + `/api/booking/create-order/${id}`, {
                    checkIn,checkOut,totalRent:total
                },{withCredentials:true})
            } catch (orderError) {
                throw orderError
            }

            const sdkLoaded = await loadRazorpayScript()
            if (!sdkLoaded) {
                setbooking(false)
                return toast.error("Razorpay SDK failed to load")
            }

            const { keyId, order } = orderResult.data
            const options = {
                key: keyId,
                amount: order.amount,
                currency: order.currency,
                name: "Zenstay",
                description: "Room Booking Payment",
                order_id: order.id,
                handler: async function (response) {
                    let verifyResult = await axios.post(serverUrl + `/api/booking/verify/${id}`, {
                        checkIn,
                        checkOut,
                        totalRent: total,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    }, { withCredentials: true })

                    await getCurrentUser()
                    await getListing()
                    setBookingData(verifyResult.data)
                    navigate("/booked")
                    toast.success("Payment successful. Booking confirmed.")
                    setbooking(false)
                },
                prefill: {
                    name: userData?.name || "",
                    email: userData?.email || ""
                },
                theme: { color: "#ef4444" },
                modal: {
                    ondismiss: () => setbooking(false)
                }
            }

            const rzp = new window.Razorpay(options)
            rzp.open()

        } catch (error) {
            console.log(error)
            setbooking(false)
            setBookingData(null)
            toast.error(error?.response?.data?.message || "Payment/booking failed")


        }

        
    }
    const cancelBooking = async (id) => {
        try {
            let result = await axios.delete( serverUrl + `/api/booking/cancel/${id}`,{withCredentials:true})
        await getCurrentUser()
        await getListing()
        console.log(result.data)
        toast.success("CancelBooking Successfully")

            
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message)
        }
        
    }

    const getMyBookings = async () => {
        try {
            const result = await axios.get(serverUrl + "/api/booking/my", { withCredentials: true })
            setMyBookings(result.data || [])
        } catch (error) {
            console.log(error)
            setMyBookings([])
        }
    }

    const cancelBookingByBookingId = async (bookingId) => {
        try {
            await axios.delete(serverUrl + `/api/booking/cancel-booking/${bookingId}`, { withCredentials: true })
            await getCurrentUser()
            await getListing()
            await getMyBookings()
            toast.success("Booking cancelled")
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Cancel failed")
        }
    }

    const updateBooking = async ({ bookingId, checkIn, checkOut, listingId }) => {
        try {
            const result = await axios.put(serverUrl + `/api/booking/update/${bookingId}`, {
                checkIn,
                checkOut,
                listingId
            }, { withCredentials: true })
            await getCurrentUser()
            await getListing()
            await getMyBookings()
            toast.success("Booking updated")
            return result.data
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message || "Update failed")
            throw error
        }
    }

    let value={
        checkIn,setCheckIn,
        checkOut,setCheckOut,
        total,setTotal,
        night,setNight,
        bookingData,setBookingData,
        handleBooking,cancelBooking,booking,setbooking,
        myBookings,setMyBookings,getMyBookings,
        cancelBookingByBookingId,updateBooking

    }
  return (
    <div>
      <bookingDataContext.Provider value={value}>
        {children}
      </bookingDataContext.Provider>
    </div>
  )
}

export default BookingContext

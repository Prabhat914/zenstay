import React, { useContext, useEffect, useMemo, useState } from 'react'
import { userDataContext } from '../Context/UserContext'
import { listingDataContext } from '../Context/ListingContext'
import { useNavigate } from 'react-router-dom'
import { FaStar } from "react-icons/fa";
import { GiConfirmed } from "react-icons/gi";
import { FcCancel } from "react-icons/fc";
import { bookingDataContext } from '../Context/BookingContext';
import logoImage from '../assets/zenstay-logo.jpeg'

function Card({ title, landMark, image1, image2, image3, rent, city, country, id, ratings, isBooked, host }) {
    let navigate = useNavigate()
    let { userData } = useContext(userDataContext)
    let { handleViewCard } = useContext(listingDataContext)
    let [popUp, setPopUp] = useState(false)
    let {cancelBooking}=useContext(bookingDataContext)
    const fallbackImage = logoImage
    const images = useMemo(
        () => [image1, image2, image3].filter(Boolean),
        [image1, image2, image3]
    )
    const [imgIndex, setImgIndex] = useState(0)
    const safeLandMark = String(landMark || "Location").toUpperCase()
    const safeCity = String(city || "City").toUpperCase()
    const safeCountry = String(country || "").trim().toUpperCase()
    const safeLocation = safeCountry ? `${safeCity}, ${safeCountry}` : safeCity
    const safeTitle = String(title || "Zenstay Room").toUpperCase()
    const safeRatings = Number.isFinite(Number(ratings)) ? Number(ratings) : 0
    const safeRent = Number.isFinite(Number(rent)) ? Number(rent) : 0

    useEffect(() => {
        setImgIndex(0)
    }, [image1, image2, image3])

    const handleImageError = (e) => {
        if (imgIndex < images.length - 1) {
            setImgIndex((prev) => prev + 1)
            return
        }
        e.currentTarget.onerror = null
        e.currentTarget.src = fallbackImage
    }
    const handleClick = () => {
        if (userData) {
            handleViewCard(id)
        }
        else {
            navigate("/login")
        }
    }
    return (
        <div className='group w-[330px] max-w-[85%] h-[460px] flex items-start justify-start flex-col rounded-lg cursor-pointer relative z-[10] transition duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_18px_45px_rgba(15,23,42,0.18)]' onClick={() => !isBooked ? handleClick() : null}>

            {isBooked && <div className='text-[green] bg-white rounded-lg absolute flex items-center justify-center right-1 top-1 gap-[5px] p-[5px]'><GiConfirmed className='w-[20px] h-[20px] text-[green]' />Booked</div>}
            {isBooked && host == userData?._id && <div className='text-[red] bg-white rounded-lg absolute flex items-center justify-center right-1 top-[50px] gap-[5px] p-[5px]' onClick={()=>setPopUp(true)} ><FcCancel className='w-[20px] h-[20px]' />Cancel Booking</div>}

            {popUp && <div className='w-[300px] h-[100px]  bg-[#ffffffdf] absolute top-[110px] left-[13px] rounded-lg ' >
            <div className='w-[100%] h-[50%] text-[#2e2d2d] flex items-start justify-center rounded-lg overflow-auto text-[20px]  p-[10px]'>Booking Cancel!</div>
                <div className='w-[100%] h-[50%] text-[18px] font-semibold flex items-start justify-center gap-[10px] text-[#986b6b]'>Are you sure? <button className='px-[20px] bg-[red] text-[white] rounded-lg hover:bg-slate-600 ' onClick={()=>{cancelBooking(id);setPopUp(false)}}>Yes</button><button className='px-[10px] bg-[red] text-[white] rounded-lg hover:bg-slate-600' onClick={()=>setPopUp(false)}>No</button></div>
            </div>}
           
            <div className='w-[100%] h-[67%] rounded-lg overflow-hidden flex'>
                <img
                    src={images[imgIndex] || fallbackImage}
                    onError={handleImageError}
                    alt="listing"
                    className='w-[100%] h-[100%] object-cover transition duration-500 ease-out group-hover:scale-110'
                />
            </div>
            <div className=' w-[100%] h-[33%] py-[20px] flex flex-col gap-[2px]'>
                <div className='flex items-center justify-between text-[18px] '><span className='w-[80%] text-ellipsis overflow-hidden font-semibold text-nowrap text-[#4a3434]'>In {safeLandMark}, {safeLocation}</span>
                    <span className='flex items-center justify-center gap-[5px]'><FaStar className='text-[#eb6262]' />{safeRatings}</span>
                </div>
                <span className='text-[15px] w-[80%] text-ellipsis overflow-hidden text-nowrap'>{safeTitle} </span>
                <span className='text-[16px] font-semibold text-[#986b6b]'>Rs.{safeRent}/day</span>
            </div>

        </div>
    )
}

export default Card


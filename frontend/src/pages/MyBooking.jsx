import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeftLong } from "react-icons/fa6";
import { bookingDataContext } from '../Context/BookingContext';
import { listingDataContext } from '../Context/ListingContext';

function MyBooking() {
    let navigate = useNavigate()
    const { myBookings, getMyBookings, cancelBookingByBookingId, updateBooking } = useContext(bookingDataContext)
    const { listingData, getListing } = useContext(listingDataContext)

    const [editingBooking, setEditingBooking] = useState(null)
    const [newCheckIn, setNewCheckIn] = useState("")
    const [newCheckOut, setNewCheckOut] = useState("")
    const [newRoomId, setNewRoomId] = useState("")

    useEffect(() => {
        getMyBookings()
        getListing()
    }, [])

    const availableRooms = useMemo(() => {
        if (!editingBooking) return []
        const currentRoomId = String(editingBooking.listing?._id || "")
        return (listingData || []).filter((room) => {
            const roomId = String(room._id || "")
            if (roomId === currentRoomId) return true
            return !room.isBooked
        })
    }, [editingBooking, listingData])

    const openEdit = (booking) => {
        setEditingBooking(booking)
        setNewCheckIn(new Date(booking.checkIn).toISOString().split("T")[0])
        setNewCheckOut(new Date(booking.checkOut).toISOString().split("T")[0])
        setNewRoomId(String(booking.listing?._id || ""))
    }

    const submitEdit = async () => {
        if (!editingBooking) return
        await updateBooking({
            bookingId: editingBooking._id,
            checkIn: newCheckIn,
            checkOut: newCheckOut,
            listingId: newRoomId
        })
        setEditingBooking(null)
    }

    return (
        <div className='w-[100vw] min-h-[100vh] flex items-center justify-start flex-col gap-[30px] relative px-[20px] pb-[30px]'>
            <div className='w-[50px] h-[50px] bg-[red] cursor-pointer absolute top-[5%] left-[20px] rounded-[50%] flex items-center justify-center' onClick={() => navigate("/")}>
                <FaArrowLeftLong className='w-[25px] h-[25px] text-[white]' />
            </div>
            <div className='w-[60%] h-[10%] border-[2px] border-[#908c8c] p-[15px] flex items-center justify-center text-[30px] rounded-md text-[#613b3b] font-semibold mt-[30px] md:w-[600px] text-nowrap'>
                MY BOOKING
            </div>

            <div className='w-[100%] max-w-[1000px] flex flex-col gap-[15px]'>
                {(myBookings || []).length === 0 && (
                    <div className='w-[100%] bg-white border border-gray-300 rounded-lg p-[20px] text-center'>
                        No active booking found.
                    </div>
                )}

                {(myBookings || []).map((booking) => (
                    <div key={booking._id} className='w-[100%] bg-white border border-gray-300 rounded-lg p-[15px] flex flex-col gap-[10px]'>
                        <div className='font-semibold text-[20px]'>{booking.listing?.title || "Zenstay Room"}</div>
                        <div>{`In ${booking.listing?.landMark || "Location"}, ${booking.listing?.city || "City"}`}</div>
                        <div>{`CheckIn: ${new Date(booking.checkIn).toLocaleDateString()} | CheckOut: ${new Date(booking.checkOut).toLocaleDateString()}`}</div>
                        <div>{`Total Rent: Rs.${Number(booking.totalRent || 0).toFixed(2)}`}</div>
                        <div className='flex gap-[10px]'>
                            <button className='px-[18px] py-[8px] bg-[red] text-white rounded-lg' onClick={() => openEdit(booking)}>
                                Change Date/Room
                            </button>
                            <button className='px-[18px] py-[8px] bg-black text-white rounded-lg' onClick={() => cancelBookingByBookingId(booking._id)}>
                                Cancel Booking
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {editingBooking && (
                <div className='fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-[20px]'>
                    <div className='w-[100%] max-w-[600px] bg-white rounded-lg p-[20px] flex flex-col gap-[12px]'>
                        <h2 className='text-[24px] font-semibold'>Modify Booking</h2>

                        <label className='text-[16px]'>New CheckIn</label>
                        <input type="date" className='border border-gray-400 rounded-md p-[8px]' value={newCheckIn} onChange={(e) => setNewCheckIn(e.target.value)} />

                        <label className='text-[16px]'>New CheckOut</label>
                        <input type="date" className='border border-gray-400 rounded-md p-[8px]' value={newCheckOut} onChange={(e) => setNewCheckOut(e.target.value)} />

                        <label className='text-[16px]'>Change Room</label>
                        <select className='border border-gray-400 rounded-md p-[8px]' value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)}>
                            {availableRooms.map((room) => (
                                <option key={room._id} value={room._id}>
                                    {`${room.title} - ${room.city} (Rs.${room.rent}/day)`}
                                </option>
                            ))}
                        </select>

                        <div className='flex gap-[10px] mt-[10px]'>
                            <button className='px-[20px] py-[8px] bg-[red] text-white rounded-lg' onClick={submitEdit}>Save Changes</button>
                            <button className='px-[20px] py-[8px] bg-gray-200 rounded-lg' onClick={() => setEditingBooking(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyBooking

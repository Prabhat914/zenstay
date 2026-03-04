import Booking from "../model/booking.model.js"
import Listing from "../model/listing.model.js"
import User from "../model/user.model.js"
import crypto from "crypto"

const createBookingRecord = async ({ listing, checkIn, checkOut, totalRent, guestId }) => {
    let booking = await Booking.create({
        checkIn,
        checkOut,
        totalRent,
        host: listing.host,
        guest: guestId,
        listing: listing._id
    })
    await booking.populate("host", "email")

    let user = await User.findByIdAndUpdate(guestId, {
        $push: { booking: listing._id }
    }, { new: true })
    if (!user) {
        throw new Error("User is not found")
    }
    listing.guest = guestId
    listing.isBooked = true
    await listing.save()
    return booking
}

export const createBooking = async (req,res) => {
   return res.status(403).json({
    message: "Direct booking is disabled. Complete payment first."
   })
}

export const createBookingOrder = async (req, res) => {
    try {
        const razorpayKeyId = process.env.RAZORPAY_KEY_ID
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
        if (!razorpayKeyId || !razorpayKeySecret) {
            return res.status(500).json({ message: "Razorpay keys are missing in backend .env" })
        }
        const { id } = req.params
        const { checkIn, checkOut, totalRent } = req.body

        const listing = await Listing.findById(id)
        if (!listing) {
            return res.status(404).json({ message: "Listing is not found" })
        }
        if (new Date(checkIn) >= new Date(checkOut)) {
            return res.status(400).json({ message: "Invaild checkIn/checkOut date" })
        }
        if (listing.isBooked) {
            return res.status(400).json({ message: "Listing is already Booked" })
        }

        const amount = Math.max(Math.round(Number(totalRent) * 100), 100)
        const receipt = `zenstay_${id}_${Date.now()}`
        const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")

        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}`
            },
            body: JSON.stringify({
                amount,
                currency: "INR",
                receipt,
                notes: { listingId: id, userId: req.userId }
            })
        })
        const order = await response.json()
        if (!response.ok) {
            return res.status(500).json({ message: order?.error?.description || "Failed to create payment order" })
        }

        return res.status(200).json({
            keyId: razorpayKeyId,
            order,
            listingId: id,
            checkIn,
            checkOut,
            totalRent
        })
    } catch (error) {
        return res.status(500).json({ message: `createBookingOrder error ${error}` })
    }
}

export const verifyPaymentAndCreateBooking = async (req, res) => {
    try {
        const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
        if (!razorpayKeySecret) {
            return res.status(500).json({ message: "Razorpay secret is missing in backend .env" })
        }
        const { id } = req.params
        const {
            checkIn,
            checkOut,
            totalRent,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body

        const payload = `${razorpay_order_id}|${razorpay_payment_id}`
        const expectedSignature = crypto
            .createHmac("sha256", razorpayKeySecret)
            .update(payload)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment signature verification failed" })
        }

        const listing = await Listing.findById(id)
        if (!listing) {
            return res.status(404).json({ message: "Listing is not found" })
        }
        if (new Date(checkIn) >= new Date(checkOut)) {
            return res.status(400).json({ message: "Invaild checkIn/checkOut date" })
        }
        if (listing.isBooked) {
            return res.status(400).json({ message: "Listing is already Booked" })
        }

        let booking = await createBookingRecord({
            listing,
            checkIn,
            checkOut,
            totalRent,
            guestId: req.userId
        })
        return res.status(201).json(booking)
    } catch (error) {
        return res.status(500).json({ message: `verifyPaymentAndCreateBooking error ${error}` })
    }
}
export const cancelBooking = async (req,res) => {
    try {
        let {id} = req.params
        let listing = await Listing.findByIdAndUpdate(id,{isBooked:false})
        let user = await User.findByIdAndUpdate(listing.guest,{
            $pull:{booking:listing._id}
        },{new:true})
        if(!user){
            return res.status(404).json({message:"user is not found"})
        }
        return res.status(200).json({message:"booking cancelled"})

    } catch (error) {
        return res.status(500).json({message:"booking cancel error"})
    }
    
}

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ guest: req.userId })
            .populate("listing", "title image1 image2 image3 description rent category city landMark isBooked host ratings")
            .populate("host", "email")
            .sort({ createdAt: -1 })
        return res.status(200).json(bookings)
    } catch (error) {
        return res.status(500).json({ message: `getMyBookings error ${error}` })
    }
}

export const cancelBookingByBookingId = async (req, res) => {
    try {
        const { bookingId } = req.params
        const booking = await Booking.findOne({ _id: bookingId, guest: req.userId })
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" })
        }

        const listing = await Listing.findById(booking.listing)
        if (listing) {
            listing.isBooked = false
            listing.guest = null
            await listing.save()
        }

        await User.findByIdAndUpdate(req.userId, {
            $pull: { booking: booking.listing }
        }, { new: true })

        booking.status = "cancel"
        await booking.save()
        return res.status(200).json({ message: "booking cancelled" })
    } catch (error) {
        return res.status(500).json({ message: `cancelBookingByBookingId error ${error}` })
    }
}

export const updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params
        const { checkIn, checkOut, listingId } = req.body

        const booking = await Booking.findOne({ _id: bookingId, guest: req.userId })
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" })
        }
        if (booking.status === "cancel") {
            return res.status(400).json({ message: "Cancelled booking can't be modified" })
        }
        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: "checkIn and checkOut are required" })
        }
        if (new Date(checkIn) >= new Date(checkOut)) {
            return res.status(400).json({ message: "Invaild checkIn/checkOut date" })
        }

        const oldListing = await Listing.findById(booking.listing)
        if (!oldListing) {
            return res.status(404).json({ message: "Current listing not found" })
        }

        const targetListingId = listingId || String(booking.listing)
        const targetListing = await Listing.findById(targetListingId)
        if (!targetListing) {
            return res.status(404).json({ message: "Target listing not found" })
        }

        const isRoomChange = String(targetListing._id) !== String(oldListing._id)
        if (isRoomChange && targetListing.isBooked) {
            return res.status(400).json({ message: "Selected room is already booked" })
        }

        const nights = Math.max(
            1,
            Math.round((new Date(checkOut) - new Date(checkIn)) / (24 * 60 * 60 * 1000))
        )
        const base = Number(targetListing.rent) * nights
        const tax = base * 0.07
        const service = base * 0.07
        const totalRent = base + tax + service

        if (isRoomChange) {
            oldListing.isBooked = false
            oldListing.guest = null
            await oldListing.save()

            targetListing.isBooked = true
            targetListing.guest = req.userId
            await targetListing.save()

            await User.findByIdAndUpdate(req.userId, {
                $pull: { booking: oldListing._id },
                $addToSet: { booking: targetListing._id }
            }, { new: true })

            booking.listing = targetListing._id
            booking.host = targetListing.host
        }

        booking.checkIn = new Date(checkIn)
        booking.checkOut = new Date(checkOut)
        booking.totalRent = totalRent
        await booking.save()
        await booking.populate("listing", "title image1 image2 image3 description rent category city landMark isBooked host ratings")
        await booking.populate("host", "email")

        return res.status(200).json(booking)
    } catch (error) {
        return res.status(500).json({ message: `updateBooking error ${error}` })
    }
}

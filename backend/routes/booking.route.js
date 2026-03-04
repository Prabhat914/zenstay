import express from "express"
import isAuth from "../middleware/isAuth.js"
import {
    cancelBooking,
    cancelBookingByBookingId,
    createBooking,
    createBookingOrder,
    getMyBookings,
    updateBooking,
    verifyPaymentAndCreateBooking
} from "../controllers/booking.controller.js"


let bookingRouter = express.Router()

bookingRouter.post("/create/:id",isAuth,createBooking)
bookingRouter.post("/create-order/:id",isAuth,createBookingOrder)
bookingRouter.post("/verify/:id",isAuth,verifyPaymentAndCreateBooking)
bookingRouter.delete("/cancel/:id",isAuth,cancelBooking)
bookingRouter.get("/my",isAuth,getMyBookings)
bookingRouter.put("/update/:bookingId",isAuth,updateBooking)
bookingRouter.delete("/cancel-booking/:bookingId",isAuth,cancelBookingByBookingId)

export default bookingRouter

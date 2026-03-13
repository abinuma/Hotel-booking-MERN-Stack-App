import express from "express"
import { checkAvailabilityAPI, createBooking, getHotelBookings, getUserBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

bookingRouter.post('/check-availability',protect, checkAvailabilityAPI)
bookingRouter.post('/check-availability',protect, createBooking)
bookingRouter.get('/check-availability',protect, getUserBookings)
bookingRouter.get('/check-availability',protect, getHotelBookings)

export default bookingRouter;
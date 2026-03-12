import Booking from "../models/booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";

//functionality to check availabilty of room

const checkAvailability = async ({ checkinDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkinDate },
    });
    const isAvailable = bookings.length === 0;
    return isAvailable;
  } catch (error) {
    console.error(error.message);
  }
};

//API to check availability of room
//POST /api/bookings/check-availability

export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//API to create a new booing
//POST /api/bookings/book

export const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user._id;

    //Before Booking check Availability

    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });
    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Room is not available for the selected dates",
      });
    }

    //Get totalPrice from Room
    const roomData = await Room.findById(room).populate("hotel");
    let totalPrice = roomData.pricePerNight;

    //calculate totalPrice based on nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    totalPrice *= nights;
    const booking = new Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
    });
    res.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "failed to create booking" });
  }
};

//API to get all bookings of a user
//GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user })
      .populate("room hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: "failed to fetch bookings" });
  }
};

export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) {
      return res.json({ success: false, message: "No hotel found" });
    }
    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });
    //Total bookings
    const totalBookings = bookings.length;
    const totalReveneue = bookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0,
    );
    res.json({
      success: true,
      dashboard: { totalBookings, totalReveneue, bookings },
    });
    res.json({
      success: true,
      dashboardData: { totalBookings, totalReveneue, bookings },
    });
  } catch (error) {
    res.json({ success: false, message: "failed to fetch bookings" });
  }
};

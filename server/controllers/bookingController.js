import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import transporter from "../configs/nodemailer.js";

//functionality to check availabilty of room

const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lt: checkOutDate },
      checkOutDate: { $gt: checkInDate },
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

//API to create a new booking
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
    const booking = await Booking.create({
      user,
      room,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalPrice,
      paymentMethod: "Pay At Hotel",
    });

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: req.user.email,
      subject: "Hotel booking details",
      html: ` <h2>Your booking Details</h2>
      <p>Dear ${req.user.username},</p>
      <p>Thank you for your booking! Here are your details:</p>
      <ul>
        <li> <strong>Booking ID:</strong> ${booking._id}</li>
        <li> <strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
        <li> <strong>Location:</strong> ${roomData.hotel.address}</li>
        <li> <strong>Date:</strong> ${booking.checkInDate.toDateString()}</li>
        <li> <strong>Booking Amount:</strong> ${process.env.CURRENCY || "$"} ${booking.totalPrice}/night</li>
      </ul>
      <p>We look forward to welcoming you!</p>
      <p>If you need to make any changes, feel free to contact us.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Booking created successfully",
    });
  } catch (error) {
    console.error("BOOKING ERROR 👉", error);
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
            console.log("DEBUG: No hotel found for owner", req.auth.userId);

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
      console.log("DEBUG: Bookings fetched:", bookings.length);
    console.log("DEBUG: Total Revenue:", totalRevenue);
    res.json({
      success: true,
      dashboard: { totalBookings, totalReveneue, bookings },
    });
  } catch (error) {
    res.json({ success: false, message: "failed to fetch bookings" });
  }
};

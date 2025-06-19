// updateBookingTimes.js
require('dotenv').config({ path: './.env' }); // Load environment variables from server/.env
const mongoose = require('mongoose');
const Booking = require('./models/Booking'); // Adjust path if needed
const connectDB = require('./config/db');    // Adjust path if needed

// --- Configuration ---
const CHECK_IN_HOUR_LOCAL = 12; // 12 PM Noon
const CHECK_OUT_HOUR_LOCAL = 11; // 11 AM
// --- End Configuration ---

const updateTimes = async () => {
  let connection; // Variable to hold the connection instance
  try {
    console.log('Connecting to Database...');
    // Use a separate connection for the script to ensure proper closing
    connection = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // Add other options based on your Mongoose version if needed
    });
    console.log('MongoDB Connected for script.');

    console.log('Fetching all bookings to update times...');
    // Fetch all bookings (consider filtering if needed, e.g., only 'confirmed')
    // Use .cursor() for very large collections to process one by one
    const bookings = await Booking.find({});
    console.log(`Found ${bookings.length} bookings to process.`);

    let updatedCount = 0;

    // Loop through each booking
    for (const booking of bookings) {
      let needsUpdate = false;
      const currentCheckIn = booking.checkInDate; // This is a Date object
      const currentCheckOut = booking.checkOutDate; // This is a Date object

      // Create NEW Date objects to modify, based on the existing date part
      const newCheckIn = new Date(currentCheckIn);
      newCheckIn.setHours(CHECK_IN_HOUR_LOCAL, 0, 0, 0); // Set LOCAL hours

      const newCheckOut = new Date(currentCheckOut);
      newCheckOut.setHours(CHECK_OUT_HOUR_LOCAL, 0, 0, 0); // Set LOCAL hours

      // Check if update is necessary (compare timestamps)
      if (booking.checkInDate.getTime() !== newCheckIn.getTime()) {
        booking.checkInDate = newCheckIn;
        needsUpdate = true;
      }
      if (booking.checkOutDate.getTime() !== newCheckOut.getTime()) {
        booking.checkOutDate = newCheckOut;
        needsUpdate = true;
      }

      if (needsUpdate) {
        try {
          await booking.save();
          updatedCount++;
          console.log(`Updated booking ID: ${booking._id} - New CheckIn: ${booking.checkInDate.toISOString()}, New CheckOut: ${booking.checkOutDate.toISOString()}`);
        } catch (saveError) {
          console.error(`Failed to save booking ID: ${booking._id}`, saveError);
        }
      } else {
        // console.log(`Booking ID: ${booking._id} already has correct times.`);
      }
    }

    console.log(`\nUpdate complete. ${updatedCount} bookings updated.`);

  } catch (error) {
    console.error('\n--- SCRIPT FAILED ---');
    console.error(error);
    process.exit(1); // Exit with error code
  } finally {
    // Ensure database connection is closed
    if (connection && connection.connection) {
      await connection.connection.close();
      console.log('MongoDB Connection Closed.');
    }
  }
};

// Execute the function
updateTimes();
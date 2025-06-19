// server/controllers/bookingController.js
const Booking = require('../models/Booking'); // Ensure your Booking model is correctly imported
const jwt = require('jsonwebtoken');
const { Parser } = require('json2csv');

// --- Core Availability Logic ---
const checkAvailability = async (newBookingStart, newBookingEnd, locationSlug = null, excludeBookingId = null, houseNumber = null) => {
  const start = new Date(newBookingStart);
  const end = new Date(newBookingEnd);

  console.log(`\n--- checkAvailability CALLED ---`);
  console.log(`Location: '${locationSlug || 'any'}'`);
  console.log(`Attempting to Book FROM: ${start.toISOString()} (${start.toString()})`);
  console.log(`Attempting to Book TO:   ${end.toISOString()} (${end.toString()})`);

  const blockingStatuses = ['pending_downpayment', 'downpayment_paid', 'confirmed'];
  const query = {
    status: { $in: blockingStatuses },
    checkInDate: { $lt: end },
    checkOutDate: { $gt: start }
  };

  if (locationSlug) {
    query.location = locationSlug;
  }
  if (locationSlug && locationSlug.toLowerCase() === 'tagpopongan') {
    if (houseNumber == null) {
      throw new Error('houseNumber is required for Tagpopongan availability check');
    }
    query.houseNumber = houseNumber;
    // For Tagpopongan, only block if this house is booked
  }

  if(!locationSlug && query.location) delete query.location;

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  console.log("Database Query for Overlap Check:", JSON.stringify(query, null, 2));

  try {
    const overlappingBookings = await Booking.find(query)
      .select('guestName checkInDate checkOutDate paymentStatus location houseNumber');

    console.log(`Found ${overlappingBookings.length} potentially overlapping bookings:`);
    if (overlappingBookings.length > 0) {
      overlappingBookings.forEach(b => {
        console.log(`  - ID: ${b._id}, Guest: ${b.guestName}, Loc: ${b.location}, House: ${b.houseNumber}, Status: ${b.paymentStatus}`);
        console.log(`    Existing CheckIn:  ${b.checkInDate.toISOString()} (${b.checkInDate.toString()})`);
        console.log(`    Existing CheckOut: ${b.checkOutDate.toISOString()} (${b.checkOutDate.toString()})`);
      });
    }

    // For Tagpopongan, only block if this house is booked (so MAX_CAPACITY = 1 per house)
    // For other locations, block if any booking exists (MAX_CAPACITY = 1 for the whole location)
    const MAX_CAPACITY = 1;
    const isSlotAvailable = overlappingBookings.length < MAX_CAPACITY;

    console.log(`Availability Check Result: ${isSlotAvailable ? 'Available' : 'NOT Available'}`);
    return isSlotAvailable;

  } catch (dbError) {
    console.error("Database error during availability check:", dbError);
    throw dbError;
  }
};

// --- Controller Functions ---

// @desc    Get booked date ranges for calendar UI (to be excluded)
// @route   GET /api/bookings/availability
// @access  Public
exports.getAvailability = async (req, res) => {
  console.log("--- GET /api/bookings/availability (for booked date ranges) requested ---");
  try {
    const { locationSlug } = req.query;
    // Query statuses that mean a slot is taken and should be visually blocked
    const queryStatuses = ['confirmed', 'pending_downpayment', 'downpayment_paid'];
    let query = { status: { $in: queryStatuses } };

    if (locationSlug) {
      query.location = locationSlug;
      console.log("getAvailability: Fetching bookings with query:", query);
    } else {
      // If no locationSlug, you might want to return all bookings or specific default ones.
      // For now, it fetches all bookings matching the statuses.
      console.log("getAvailability: Fetching all bookings for availability (no location slug):", query);
    }

    console.log("FINAL Mongoose Query Object:", JSON.stringify(query));

    const bookings = await Booking.find(query).select('checkInDate checkOutDate'); // Only need these fields
    console.log(`getAvailability: Found ${bookings.length} bookings to form exclusion ranges.`);

    // Return the exact start and end times as stored (which should be 12PM/11AM UTC equivalents)
    // The frontend will convert these ISO strings to local Date objects.
    const bookedDates = bookings.map(b => ({
        start: b.checkInDate.toISOString(), // Send as ISO string
        end: b.checkOutDate.toISOString()   // Send as ISO string
    }));
    // console.log("getAvailability: Mapped booked dates:", bookedDates); // Can be verbose

    res.status(200).json({
      success: true,
      bookedDates: bookedDates, // This is what CalendarView's fetchBookedDates expects
    });
    console.log("getAvailability: Response sent successfully.");

  } catch (error) {
    console.error('!!! getAvailability Error:', error);
    if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Server Error fetching availability' });
    } else {
        console.error("Headers already sent in getAvailability, cannot send error response.");
    }
  }
};


// @desc    Create a new booking (tentative, pending payment)
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  // Destructure all expected fields from the frontend
  const {
    guestName, guestEmail, guestPhone, numberOfGuests,
    checkInDate, // ISO String from client, e.g., 2025-08-08T04:00:00.000Z (12 PM PHT)
    checkOutDate, // ISO String from client, e.g., 2025-08-09T03:00:00.000Z (11 AM PHT)
    specialRequests,
    location, // Location slug (e.g., 'calinan')
    totalPrice,
    downpaymentAmount,
    status,
    houseNumber, // NEW: for Tagpopongan
  } = req.body;

  const statusToSave = req.body.status || 'pending_downpayment'; // More robust

  console.log("createBooking: Received request body:", req.body);
  console.log("Status to save will be:", statusToSave); // <<<--- ADD THIS LOG

  // --- Server-side Validation ---
  if (!guestName || !guestEmail || !guestPhone || !numberOfGuests ||
      !checkInDate || !checkOutDate || !location ||
      typeof totalPrice === 'undefined' || typeof downpaymentAmount === 'undefined') {
    return res.status(400).json({ success: false, message: 'Missing required booking details.' });
  }
  if (location.toLowerCase() === 'tagpopongan' && (houseNumber === undefined || houseNumber === null)) {
    return res.status(400).json({ success: false, message: 'House number is required for Tagpopongan bookings.' });
  }

  try {
    // Convert incoming ISO date strings to Date objects.
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    console.log("createBooking: Parsed dates for new booking (should reflect 12PM/11AM local time as UTC):");
    console.log(`  Start: ${start.toISOString()} (${start.toString()})`);
    console.log(`  End:   ${end.toISOString()} (${end.toString()})`);

    if (end.getTime() <= start.getTime()) {
      return res.status(400).json({ success: false, message: 'Check-out date/time must be after check-in date/time.' });
    }

    // --- Critical Availability Check (Again!) ---
    // For Tagpopongan, check per house; for others, check whole location
    const isAvailable = await checkAvailability(start, end, location, null, location.toLowerCase() === 'tagpopongan' ? houseNumber : null);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Sorry, the selected dates and times conflict with an existing booking. Please choose different options.',
      });
    }

    // --- Create Booking in DB ---
    let receiptUrl = undefined;
    if (req.file) {
      // Save the relative URL for frontend preview
      receiptUrl = `/uploads/${req.file.filename}`;
    }
    const booking = await Booking.create({
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests,
      checkInDate: start,   // Save the Date object with precise UTC time
      checkOutDate: end,    // Save the Date object with precise UTC time
      location,
      totalPrice,
      downpaymentAmount,
      status: statusToSave,
      specialRequests,
      houseNumber: location.toLowerCase() === 'tagpopongan' ? houseNumber : undefined,
      receiptUrl,
    });

    console.log("Booking record created:", booking._id, "Status:", booking.status, "CheckIn:", booking.checkInDate.toISOString(), "CheckOut:", booking.checkOutDate.toISOString());

    // Emit real-time event to admins
    if (req.app && req.app.get('io')) {
      req.app.get('io').emit('bookingCreated', { booking });
    }

    res.status(201).json({
      success: true,
      message: `Booking request (ID: ${booking._id}) received and tentatively held. Please proceed with payment.`,
      data: booking, // Send back the created booking object (includes ID and precise dates)
    });

  } catch (error) {
    console.error('Booking creation error:', error); // Log the actual error object
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      if (!res.headersSent) {
        return res.status(400).json({ success: false, message: messages.join('. ') });
      }
    }
    if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Server Error during booking creation' });
    } else {
        console.error("Headers already sent in createBooking, cannot send specific error response.");
    }
  }
};

// @desc    Check specific availability for given dates
// @route   POST /api/bookings/check-specific-availability
// @access  Public
exports.checkSpecificAvailability = async (req, res) => {
  const { checkInDate, checkOutDate, locationSlug } = req.body;

  if (!checkInDate || !checkOutDate || !locationSlug) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: checkInDate, checkOutDate, and locationSlug are required'
    });
  }

  try {
    const isAvailable = await checkAvailability(checkInDate, checkOutDate, locationSlug);
    
    res.status(200).json({
      success: true,
      isAvailable,
      message: isAvailable 
        ? 'Selected dates are available'
        : 'Selected dates are not available'
    });
  } catch (error) {
    console.error('Error checking specific availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking availability'
    });
  }
};

// @desc    Get available houses for Tagpopongan for a given date range
// @route   POST /api/bookings/available-houses
// @access  Public
exports.getAvailableHouses = async (req, res) => {
  const { location, checkInDate, checkOutDate } = req.body;
  if (!location || !checkInDate || !checkOutDate) {
    return res.status(400).json({ success: false, message: 'location, checkInDate, and checkOutDate are required.' });
  }
  if (location.toLowerCase() !== 'tagpopongan') {
    return res.status(400).json({ success: false, message: 'This endpoint is only for Tagpopongan.' });
  }
  try {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const blockingStatuses = ['pending_downpayment', 'downpayment_paid', 'confirmed'];
    // Find all bookings for Tagpopongan that overlap the requested range
    const bookings = await Booking.find({
      location: 'tagpopongan',
      status: { $in: blockingStatuses },
      checkInDate: { $lt: end },
      checkOutDate: { $gt: start }
    }).select('houseNumber');
    const bookedHouses = bookings.map(b => b.houseNumber);
    const allHouses = [1, 2, 3];
    const availableHouses = allHouses.filter(h => !bookedHouses.includes(h));
    res.status(200).json({ success: true, availableHouses });
  } catch (error) {
    console.error('Error fetching available houses:', error);
    res.status(500).json({ success: false, message: 'Server error while checking available houses.' });
  }
};

// --- Admin Functions ---
exports.getAllBookings = async (req, res) => {
    // ... (keep as is or adapt to new status fields) ...
    try {
        const bookings = await Booking.find().sort({ checkInDate: -1 });
        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.confirmDownpayment = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'downpayment_paid' },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking marked as downpayment paid.', data: booking });
  } catch (error) {
    console.error('Error confirming downpayment:', error);
    res.status(500).json({ success: false, message: 'Server error while confirming downpayment.' });
  }
};

exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking cancelled.', data: booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Server error while cancelling booking.' });
  }
};

exports.exportBookingsCSV = async (req, res) => {
  try {
    const bookings = await Booking.find();
    const fields = ['_id', 'guestName', 'guestEmail', 'guestPhone', 'numberOfGuests', 'checkInDate', 'checkOutDate', 'location', 'houseNumber', 'totalPrice', 'downpaymentAmount', 'status', 'createdAt', 'updatedAt'];
    const parser = new Parser({ fields });
    const csv = parser.parse(bookings);
    res.header('Content-Type', 'text/csv');
    res.attachment('bookings.csv');
    return res.send(csv);
  } catch (error) {
    console.error('Error exporting bookings:', error);
    res.status(500).json({ success: false, message: 'Server error while exporting bookings.' });
  }
};

// --- Admin Authentication Middleware (JWT) ---
// Example: hardcoded admin user for demo (replace with DB lookup in production)
const ADMIN_USER = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123', // Store hashed in production!
  role: 'admin',
};

exports.adminLogin = (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    // Issue JWT
    const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '8h' });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
};

exports.requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// --- Secure Admin Endpoints ---
// (Wrap getAllBookings, confirmDownpayment, cancelBooking with requireAdmin in routes)

exports.confirmFullPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    booking.status = 'confirmed';
    await booking.save();
    res.json({ success: true, message: 'Booking marked as fully paid' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
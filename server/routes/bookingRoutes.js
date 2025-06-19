const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getAvailability,
  createBooking,
  getAllBookings,
  checkSpecificAvailability,
  getAvailableHouses,
  adminLogin,
  requireAdmin,
  confirmDownpayment,
  cancelBooking,
  exportBookingsCSV
  // Import other controller functions (getById, update, delete)
} = require('../controllers/bookingController');

// Optional: Add authentication middleware for protected routes
// const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Public booking routes
router.route('/availability').get(getAvailability);
router.route('/check-specific-availability').post(checkSpecificAvailability);
router.route('/').post(upload.single('receipt'), createBooking);

// Admin login
router.post('/admin/login', adminLogin);
// Secure admin routes
router.get('/admin/all', requireAdmin, getAllBookings);
router.post('/admin/:id/confirm', requireAdmin, confirmDownpayment);
router.post('/admin/:id/cancel', requireAdmin, cancelBooking);
router.get('/admin/export', requireAdmin, exportBookingsCSV);
router.post('/admin/:id/fullpayment', requireAdmin, require('../controllers/bookingController').confirmFullPayment);

// Admin routes (example - protect these later)
router.route('/')
    // .get(protect, getAllBookings); // Add auth middleware
    .get(getAllBookings); // Unprotected for now

// router.route('/:id')
//     .get(protect, getBookingById)
//     .put(protect, updateBooking)
//     .delete(protect, deleteBooking);

router.route('/available-houses').post(getAvailableHouses);

module.exports = router;
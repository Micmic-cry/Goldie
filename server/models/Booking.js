const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    guestName: {
      type: String,
      required: [true, 'Guest name is required'],
      trim: true,
    },
    guestEmail: {
      type: String,
      required: [true, 'Guest email is required'],
      trim: true,
      lowercase: true,
      // Basic email validation regex (consider a library like validator.js for robustness)
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    guestPhone: {
      type: String,
      required: [true, 'Guest phone number is required'],
      trim: true,
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Must have at least 1 guest'],
      // Add max if applicable: max: [MAX_CAPACITY, `Maximum capacity exceeded`]
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
      // Add validation: checkOutDate must be after checkInDate
      validate: [
        function (value) {
          // 'this' refers to the document being validated
          return this.checkInDate < value;
        },
        'Check-out date must be after check-in date',
      ],
    },
    status: {
      type: String,
      required: true,
      enum: ['pending_downpayment', 'downpayment_paid', 'confirmed', 'cancelled', 'completed', 'tentative'], // Add 'tentative' if you prefer
      default: 'pending_downpayment',
    },
    // Optional fields
    specialRequests: {
      type: String,
      trim: true,
    },
    googleCalendarEventId: { // If syncing to Google Calendar
      type: String,
      trim: true,
    },
    location: { 
      type: String, 
      required: true 
    },
    totalPrice: { // <<<--- ADD THIS FIELD (optional, but good for record)
      type: Number,
      required: false, // Or true if always calculated
    },
    downpaymentAmount: { // <<<--- ADD THIS FIELD
      type: Number,
      required: false,
    },
    source: {
      type: String,
      enum: ['website', 'airbnb', 'facebook'],
      default: 'website',
    },
    houseNumber: {
      type: Number,
      required: function() { return this.location && this.location.toLowerCase() === 'tagpopongan'; },
      min: 1,
      max: 3,
    },
    receiptUrl: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }

  
);

// Optional: Indexing for performance on common queries
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ paymentStatus: 1 }); // Index new field
if (bookingSchema.paths.location) { // Conditionally add index if location path exists
    bookingSchema.index({ location: 1 });
}
bookingSchema.index({ location: 1, houseNumber: 1, checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
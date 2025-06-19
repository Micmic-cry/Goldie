// client/src/components/BookingForm.jsx

import React, { useState, useEffect } from 'react';
// Assuming Sections.css contains the necessary form styling defined previously

// Constants can be defined here or imported if used elsewhere
const GUEST_LIMIT = 10;
const EXCESS_GUEST_FEE = 350; // For displaying messages

function BookingForm({
    checkInDate,        // Received from parent (BookingPage), used for validation
    checkOutDate,       // Received from parent (BookingPage), used for validation
    onSubmit,           // Function to call on successful submit (handleBookingSubmit in BookingPage)
    isSubmitting,       // Boolean to disable button during submission
    initialGuestCount = 1, // Default guest count from parent (BookingCard selection)
    showHouseSelect = false, // New prop: show house select for Tagpopongan
    houseOptions = [1,2,3], // New prop: which houses to show (default 1-3)
}) {

  // Internal state for form fields
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: initialGuestCount, // Initialize with prop
    specialRequests: '',
    houseNumber: showHouseSelect ? houseOptions[0] : undefined, // Default to first house if shown
  });
  const [errors, setErrors] = useState({}); // State for validation errors

  // Effect to update internal guest count if the initial prop changes after mount
  // This might happen if the modal is kept mounted and user changes guests on card
  // Though typically the modal might remount or receive the latest count on open
  useEffect(() => {
      setFormData(prev => ({ ...prev, numberOfGuests: initialGuestCount }));
  }, [initialGuestCount]);

  // Handle changes in form inputs
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Handle number input specifically
    const newValue = type === 'number' ? parseInt(value, 10) || '' : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));

    // Clear validation error for the field being changed
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
    }
     // Clear general date error if user starts typing after seeing it
     if (errors.dates && (name === 'guestName' || name === 'guestEmail' || name === 'guestPhone')) {
         setErrors(prev => ({...prev, dates: null}));
     }
  };

  // Validate the form data
  const validateForm = () => {
    const newErrors = {};
    // Although modal opening implies dates exist, check props defensively
    // Or remove this check if guaranteed by parent logic
    if (!checkInDate || !checkOutDate) newErrors.dates = 'Error: Check-in/out dates missing. Please re-select.';

    // Basic required field checks
    if (!formData.guestName.trim()) newErrors.guestName = 'Name is required.';
    if (!formData.guestEmail.trim()) newErrors.guestEmail = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(formData.guestEmail)) newErrors.guestEmail = 'Invalid email format.'; // Basic email format
    if (!formData.guestPhone.trim()) newErrors.guestPhone = 'Phone number is required.';
    // Optional: Add stricter phone number format validation regex here

    // Guest number validation
    if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
        newErrors.numberOfGuests = 'At least one guest is required.';
    } else {
        // Optional: Add a check against a maximum capacity if needed
        // const MAX_CAPACITY = 16; // Example
        // if (formData.numberOfGuests > MAX_CAPACITY) {
        //    newErrors.numberOfGuests = `Maximum capacity is ${MAX_CAPACITY} guests.`;
        // }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default browser form submission
    if (!validateForm()) {
        console.log("Form validation failed:", errors);
        return; // Stop if validation fails
    }
    // If valid, call the onSubmit prop passed from BookingPage
    // This prop should point to handleBookingSubmit, passing the form's current state
    console.log("Form validated, calling onSubmit prop with:", formData);
    onSubmit(formData);
  };

  // --- Render JSX ---
  return (
    // className allows modal CSS to potentially override padding/borders
    <form onSubmit={handleSubmit} className="booking-form">
      {/* Optional: Display general date error if validation fails */}
       {errors.dates && <p className="error-message mb-4 text-center">{errors.dates}</p>}

      {/* House selection for Tagpopongan */}
      {showHouseSelect && (
        <div className="form-group">
          <label htmlFor="houseNumber" className="block mb-1.5 text-sm font-medium text-brand-text-secondary-dark">Select House:</label>
          <select
            id="houseNumber"
            name="houseNumber"
            value={formData.houseNumber}
            onChange={handleChange}
            required
            className="w-full p-2.5 border rounded-md focus:ring-1 focus:outline-none border-brand-border focus:border-brand-avocado focus:ring-brand-avocado"
          >
            {houseOptions.map((num) => (
              <option key={num} value={num}>House {num}</option>
            ))}
          </select>
        </div>
      )}

      {/* Form Groups for each input */}
      <div className="form-group">
        <label htmlFor="guestName" className="block mb-1.5 text-sm font-medium text-brand-text-secondary-dark">Full Name:</label>
        <input
          type="text"
          id="guestName"
          name="guestName"
          value={formData.guestName}
          onChange={handleChange}
          required
          className={`w-full p-2.5 border rounded-md focus:ring-1 focus:outline-none ${errors.guestName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-brand-border focus:border-brand-avocado focus:ring-brand-avocado'}`}
        />
         {errors.guestName && <span className="text-red-600 text-xs mt-1 block">{errors.guestName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="guestEmail" className="block mb-1.5 text-sm font-medium text-brand-text-secondary-dark">Email:</label>
        <input
          type="email"
          id="guestEmail"
          name="guestEmail"
          value={formData.guestEmail}
          onChange={handleChange}
          required
          className={`w-full p-2.5 border rounded-md focus:ring-1 focus:outline-none ${errors.guestEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-brand-border focus:border-brand-avocado focus:ring-brand-avocado'}`}
        />
         {errors.guestEmail && <span className="text-red-600 text-xs mt-1 block">{errors.guestEmail}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="guestPhone" className="block mb-1.5 text-sm font-medium text-brand-text-secondary-dark">Phone:</label>
        <input
          type="tel"
          id="guestPhone"
          name="guestPhone"
          value={formData.guestPhone}
          onChange={handleChange}
          required
          className={`w-full p-2.5 border rounded-md focus:ring-1 focus:outline-none ${errors.guestPhone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-brand-border focus:border-brand-avocado focus:ring-brand-avocado'}`}
        />
        {errors.guestPhone && <span className="text-red-600 text-xs mt-1 block">{errors.guestPhone}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="numberOfGuests" className="block mb-1.5 text-sm font-medium text-brand-text-secondary-dark">Number of Guests:</label>
        <input
          type="number"
          id="numberOfGuests"
          name="numberOfGuests"
          value={formData.numberOfGuests}
          onChange={handleChange}
          min="1"
          // max="16" // Set a reasonable max based on dropdown/capacity
          required
          className={`w-full p-2.5 border rounded-md focus:ring-1 focus:outline-none ${errors.numberOfGuests ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-brand-border focus:border-brand-avocado focus:ring-brand-avocado'}`}
          />
        {errors.numberOfGuests && <span className="text-red-600 text-xs mt-1 block">{errors.numberOfGuests}</span>}
        {/* Display surcharge reminder based on form's current guest count */}
        {formData.numberOfGuests > GUEST_LIMIT && (
            <span className="text-xs text-brand-text-secondary-dark block mt-1">
                Note: Additional fee of ₱{EXCESS_GUEST_FEE} per guest over {GUEST_LIMIT} applies.
            </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="specialRequests" className="block mb-1.5 text-sm font-medium text-brand-text-secondary-dark">Special Requests (Optional):</label>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          rows="3"
          className="w-full p-2.5 border border-brand-border rounded-md focus:ring-1 focus:outline-none focus:border-brand-avocado focus:ring-brand-avocado resize-vertical"
        ></textarea>
      </div>

      {/* Submit Button - Uses styling from Sections.css */}
      <button
        type="submit"
        className="reserve-button mt-4" // Use reserve-button style, add margin-top
        disabled={isSubmitting} // Disable when parent signals submission is in progress
      >
        {isSubmitting ? 'Processing...' : 'Confirm Booking'}
      </button>
    </form>
  );
}

export default BookingForm;
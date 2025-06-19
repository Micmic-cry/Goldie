// client/src/components/BookingCard.jsx

import React from 'react'; // Removed useState
import './Sections.css'; // Ensure shared styles are imported

// Helper function (consider moving to a shared utils file)
const formatDateInput = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

function BookingCard({
    pricePerNight,          // Base price per night (can change based on check-in day)
    checkInDate,            // Selected check-in date state
    checkOutDate,           // Selected check-out date state
    numGuests,              // Current number of guests state (from parent)
    onGuestsChange,         // Function to call when guest dropdown changes (passed from parent)
    guestLimit,             // Max guests before surcharge (e.g., 10)
    excessGuestFee,         // Fee per guest over the limit (e.g., 350)
    onDateFocus,            // Function to call when date inputs are clicked (scrolls/focuses calendar)
    onReserve               // Function to call when Reserve button is clicked (opens confirmation modal)
    // isSubmitting prop is likely not needed here anymore as the final submit is in the modal
}) {

    // Calculate number of nights based on selected dates
    const numberOfNights = (checkInDate && checkOutDate)
        ? Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)))
        : 0; // Show 0 nights if dates aren't selected

    // Calculate potential surcharge based on current guest count
    const guestSurcharge = numGuests > guestLimit
        ? (numGuests - guestLimit) * excessGuestFee * numberOfNights // Multiply by nights for total surcharge
        : 0;

    // Calculate total estimated price including surcharge
    const baseTotal = pricePerNight * numberOfNights;
    const totalPrice = baseTotal + guestSurcharge;

    // Function to handle the main button click
    const handleReserveClick = () => {
        if (onReserve) {
            onReserve(); // Call the function passed from BookingPage (opens modal or focuses dates)
        }
    }

    // Generate guest options for the dropdown
    const guestOptions = [];
    const maxGuestsInDropdown = 16; // How many options to show (adjust as needed)
    for (let i = 1; i <= maxGuestsInDropdown; i++) {
        let label = `${i} guest${i > 1 ? 's' : ''}`;
        // Optionally add surcharge info directly in dropdown - might get long
        // if (i > guestLimit && numberOfNights > 0) {
        //     const surchargeForOption = (i - guestLimit) * excessGuestFee * numberOfNights;
        //     label += ` (+₱${surchargeForOption.toLocaleString()})`;
        // }
        guestOptions.push(<option key={i} value={i}>{label}</option>);
    }

    return (
        <div className="booking-card">
            {/* Price per night display */}
            <div className="booking-card-price">
                <span className="price-amount">₱{pricePerNight?.toLocaleString()}</span>
                <span className="price-unit"> night</span>
                {/* Display surcharge notice only if applicable */}
                {numGuests > guestLimit && (
                    <span className='text-xs text-brand-text-secondary-dark ml-2 font-medium'>(+ fee for {numGuests - guestLimit} extra guest{numGuests - guestLimit > 1 ? 's' : ''})</span>
                )}
            </div>

            {/* Date and Guest Inputs */}
            <div className="booking-card-inputs">
                <div className="date-inputs">
                    <div className="date-input-group" onClick={onDateFocus} tabIndex="0" onKeyPress={onDateFocus} role="button" aria-label="Select Check-in Date">
                        <label htmlFor="checkin-display">CHECK-IN</label>
                        <div id="checkin-display" className="date-display">{formatDateInput(checkInDate) || 'Add date'}</div>
                    </div>
                    <div className="date-input-group" onClick={onDateFocus} tabIndex="0" onKeyPress={onDateFocus} role="button" aria-label="Select Check-out Date">
                        <label htmlFor="checkout-display">CHECKOUT</label>
                        <div id="checkout-display" className="date-display">{formatDateInput(checkOutDate) || 'Add date'}</div>
                    </div>
                </div>
                <div className="guest-input-group">
                    <label htmlFor="guests-card-select">GUESTS</label>
                    <select
                        id="guests-card-select"
                        value={numGuests} // Controlled by parent state
                        onChange={(e) => onGuestsChange(e.target.value)} // Call parent handler on change
                        className="focus:outline-none" // Remove default focus outline if needed
                    >
                        {/* Render dynamic guest options */}
                        {guestOptions}
                    </select>
                </div>
            </div>

            {/* Reserve/Check Availability Button */}
            <button
                onClick={handleReserveClick}
                className="reserve-button w-full" // Ensure w-full is applied if needed
                // Button should generally be enabled unless maybe dates ARE selected but something else is wrong?
                // For now, enable based on parent logic (modal won't open if dates invalid)
            >
                {checkInDate && checkOutDate ? 'Reserve' : 'Check availability'}
            </button>

            {/* Pricing Details (only shown when dates are selected) */}
            {numberOfNights > 0 && (
                <div className="booking-card-pricing-details">
                    <p>You won't be charged yet</p>
                    {/* Base price calculation */}
                    <div className="price-calculation">
                        <span>₱{pricePerNight?.toLocaleString()} x {numberOfNights} nights</span>
                        <span>₱{baseTotal.toLocaleString()}</span>
                    </div>
                    {/* Show surcharge only if applicable */}
                    {guestSurcharge > 0 && (
                         <div className="price-calculation">
                             {/* Be clear about the fee */}
                             <span>Extra guest fee ({numGuests - guestLimit} guest{numGuests-guestLimit > 1 ? 's':''})</span>
                             <span>₱{guestSurcharge.toLocaleString()}</span>
                         </div>
                    )}
                    {/* Final total */}
                    <div className="price-total">
                        <span>Total</span>
                        <span>₱{totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            )}
            {/* Prompt if dates aren't selected */}
             {numberOfNights === 0 && (
                <p className="select-dates-prompt">Select check-in and check-out dates to see the price.</p>
             )}
        </div>
    );
}

export default BookingCard;
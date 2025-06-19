// client/src/components/BookingOptionsMenuModal.jsx

import React, { useState, useEffect, useCallback, } from 'react';
import { FaTimes, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import CalendarView from './CalendarView'; // Assuming CalendarView handles its own API calls
import './Sections.css'; // Shared styles (ensure modal styles are here)
import { fetchBookedDates, fetchAvailableHouses } from '../services/api'; // Add this import at the top

// Constants (could be imported from a config file or passed as props if they vary per location fundamentally)
const WEEKDAY_PRICE_OVERRIDE = 12000;
const WEEKEND_PRICE_OVERRIDE = 10000;
const GUEST_LIMIT = 10;
const EXCESS_GUEST_FEE = 350;

const formatDateDisplay = (date) => {
  if (!date) return 'Select date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function BookingOptionsMenuModal({
  isOpen,
  onClose,
  locationData,         // Current location's data (name, default pricePerNight)
  onProceedToPayment    // Callback to trigger when "Proceed to Payment" is clicked
}) {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [numGuests, setNumGuests] = useState(1);
  const [currentPricePerNight, setCurrentPricePerNight] = useState(0);
  const [calendarKey, setCalendarKey] = useState(Date.now()); // For refreshing calendar if needed
  const [calendarKeyForModal, setCalendarKeyForModal] = useState(Date.now());
  const [isFullyBooked, setIsFullyBooked] = useState(false); // New state for warning
  const [availableHouses, setAvailableHouses] = useState([]); // For Tagpopongan
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [houseLoading, setHouseLoading] = useState(false);
  const [houseError, setHouseError] = useState('');

  // Effect to initialize/reset state when the modal opens or locationData changes
  useEffect(() => {
    if (isOpen) {
        // When modal opens, give its calendar a new key to force re-fetch of availability
        setCalendarKeyForModal(Date.now()); // <<<--- THIS IS THE KEY PART
        // Also reset dates selected within this modal, etc.
        setCheckInDate(null);
        setCheckOutDate(null);
        setNumGuests(1);
        if (locationData) {
          setCurrentPricePerNight(locationData.pricePerNight || WEEKDAY_PRICE_OVERRIDE);
        }
      }
  }, [isOpen, locationData]); // Re-run if modal opens or location changes

  // Update dynamic price per night based on selected check-in day
  useEffect(() => {
    if (!locationData) return; // Don't run if location data isn't loaded

    let basePriceToSet = locationData.pricePerNight || WEEKDAY_PRICE_OVERRIDE; // Fallback to default
    if (checkInDate) {
      const dayOfWeek = checkInDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      if ([5, 6, 0].includes(dayOfWeek)) { // Fri, Sat, Sun check-ins
        basePriceToSet = WEEKEND_PRICE_OVERRIDE;
      } else { // Mon-Thu check-ins
        basePriceToSet = WEEKDAY_PRICE_OVERRIDE;
      }
    }
    setCurrentPricePerNight(basePriceToSet);
  }, [checkInDate, locationData]); // Rerun when checkInDate or locationData changes

  const handleDateChange = useCallback((start, end) => {
    // Get all day elements before setting the dates
    const allDays = document.querySelectorAll('.react-datepicker__day:not(.react-datepicker__day--outside-month)');
    
    // Find both start and end days by their text content
    const startDayNumber = start?.getDate();
    const endDayNumber = end?.getDate();
    
    console.log('Looking for days:', startDayNumber, endDayNumber);
    
    // Find the days before they get selected
    const startDay = startDayNumber ? Array.from(allDays).find(day => {
      const dayText = parseInt(day.textContent.trim());
      const isMatch = dayText === startDayNumber;
      if (isMatch) {
        console.log('Found start day with classes:', day.classList.toString());
      }
      return isMatch;
    }) : null;
    
    const endDay = endDayNumber ? Array.from(allDays).find(day => {
      const dayText = parseInt(day.textContent.trim());
      const isMatch = dayText === endDayNumber;
      if (isMatch) {
        console.log('Found end day with classes:', day.classList.toString());
      }
      return isMatch;
    }) : null;
    
    // Check for both red and yellow classes
    const isStartRed = startDay?.classList.contains('fully-booked');
    const isStartYellow = startDay?.classList.contains('partial-booked-checkin');
    const isEndRed = endDay?.classList.contains('fully-booked');
    const isEndYellow = endDay?.classList.contains('partial-booked-checkin');
    
    // Check all days in the range for fully booked days and consecutive partially booked days
    let hasFullyBookedDayInRange = false;
    let hasConsecutivePartiallyBookedDays = false;
    
    if (start && end) {
      const daysInRange = Array.from(allDays).filter(day => {
        const dayText = parseInt(day.textContent.trim());
        return dayText >= startDayNumber && dayText <= endDayNumber;
      });
      
      console.log('Days in range:', daysInRange.map(d => d.textContent));
      
      // Check for fully booked days
      hasFullyBookedDayInRange = daysInRange.some(day => 
        day.classList.contains('fully-booked')
      );
      
      // Check for consecutive partially booked days
      for (let i = 0; i < daysInRange.length - 1; i++) {
        const currentDay = daysInRange[i];
        const nextDay = daysInRange[i + 1];
        
        if (currentDay.classList.contains('partial-booked-checkin') && 
            nextDay.classList.contains('partial-booked-checkin')) {
          hasConsecutivePartiallyBookedDays = true;
          break;
        }
      }
      
      console.log('Has fully booked day in range:', hasFullyBookedDayInRange);
      console.log('Has consecutive partially booked days:', hasConsecutivePartiallyBookedDays);
    }
    
    console.log('Start day classes:', startDay?.classList.toString());
    console.log('End day classes:', endDay?.classList.toString());
    console.log('Start day - Red:', isStartRed, 'Yellow:', isStartYellow);
    console.log('End day - Red:', isEndRed, 'Yellow:', isEndYellow);
    
    // Show warning if both are red OR if one is red and one is yellow OR if any day in range is fully booked
    // OR if there are consecutive partially booked days
    const shouldShowWarning = (isStartRed && isEndRed) || // Both are red
                            (isStartRed && isEndYellow) || // Start is red, end is yellow
                            (isStartYellow && isEndRed) || // Start is yellow, end is red
                            hasFullyBookedDayInRange ||    // Any day in range is fully booked
                            hasConsecutivePartiallyBookedDays; // Consecutive partially booked days
    
    console.log('Should show warning:', shouldShowWarning);
    
    // Now set the dates
    setCheckInDate(start);
    setCheckOutDate(end);
    setIsFullyBooked(shouldShowWarning);
  }, []);

  useEffect(() => {
    console.log('isFullyBooked state:', isFullyBooked);
  }, [isFullyBooked]);

  const handleNumGuestsChange = useCallback((e) => {
    setNumGuests(Math.max(1, parseInt(e.target.value, 10) || 1));
  }, []);

  // Calculations for display
  const numberOfNights = (checkInDate && checkOutDate)
    ? Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)))
    : 0;
  const guestSurcharge = numGuests > GUEST_LIMIT ? (numGuests - GUEST_LIMIT) * EXCESS_GUEST_FEE * numberOfNights : 0; // Surcharge per night * nights
  const estimatedBaseTotal = currentPricePerNight * numberOfNights;
  const estimatedTotalPrice = estimatedBaseTotal + guestSurcharge;

  // Fetch available houses for Tagpopongan after dates are selected
  useEffect(() => {
    const fetchHouses = async () => {
      if (
        locationData?.slug === 'tagpopongan' &&
        checkInDate && checkOutDate &&
        !isFullyBooked
      ) {
        setHouseLoading(true);
        setHouseError('');
        setAvailableHouses([]);
        setSelectedHouse(null);
        try {
          const houses = await fetchAvailableHouses('tagpopongan', checkInDate.toISOString(), checkOutDate.toISOString());
          setAvailableHouses(houses);
          setSelectedHouse(houses[0] || null); // Default to first available
        } catch (err) {
          setHouseError('Could not fetch available houses.');
        } finally {
          setHouseLoading(false);
        }
      } else {
        setAvailableHouses([]);
        setSelectedHouse(null);
      }
    };
    fetchHouses();
  }, [locationData?.slug, checkInDate, checkOutDate, isFullyBooked]);

  const handleProceedClick = async () => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select both check-in and check-out dates.");
      return;
    }
    if (isFullyBooked) {
      alert("Warning: The selected dates include fully booked days. Please select different dates.");
      return;
    }
    if (locationData?.slug === 'tagpopongan' && (!selectedHouse || availableHouses.length === 0)) {
      alert("Please select a house for your stay.");
      return;
    }
    const dataToPass = {
        locationName: locationData.name,
        locationSlug: locationData.slug,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        numGuests,
        calculatedPricePerNight: currentPricePerNight,
        calculatedTotalPrice: estimatedTotalPrice,
        numberOfNights: numberOfNights,
        ...(locationData?.slug === 'tagpopongan' ? { houseNumber: selectedHouse } : {}),
    };
    console.log("BookingOptionsMenuModal: Data being passed:", dataToPass);
    onProceedToPayment(dataToPass);
    onClose();
  };

  // Escape key and body scroll handling
  useEffect(() => {
    const handleEsc = (event) => { if (event.keyCode === 27) onClose(); };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !locationData) return null;

  const handleContentClick = (e) => e.stopPropagation();

  // Guest dropdown options
  const guestOptions = [];
  for (let i = 1; i <= 16; i++) { // Example: up to 16 guests
    guestOptions.push(<option key={i} value={i}>{i} guest{i > 1 ? 's' : ''}</option>);
  }

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`modal-content max-w-2xl ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={handleContentClick}>
        <div className="modal-header">
          <h3 className="modal-title">Select Options for {locationData.name}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close booking options"><FaTimes /></button>
        </div>
        <div className="modal-body space-y-6">
          {/* Calendar View */}
          <div>
            <h4 className="text-lg font-semibold text-brand-text-dark mb-2 flex items-center">
              <FaCalendarAlt className="mr-2 text-brand-avocado" />Select Dates
            </h4>
            <p className='text-xs text-brand-text-secondary-dark mb-3'>Fri-Sun check-in: ₱{WEEKEND_PRICE_OVERRIDE.toLocaleString()}/night, Mon-Thu: ₱{WEEKDAY_PRICE_OVERRIDE.toLocaleString()}/night.</p>
            <div className="border border-brand-border rounded-lg p-3 md:p-4">
              <CalendarView
                refreshTrigger={calendarKeyForModal} // Pass this modal's key as refreshTrigger
                locationSlug={locationData?.slug}
                key={calendarKey} // To re-trigger fetchBookedDates if needed
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                onDateChange={handleDateChange}
                // Pass locationSlug to CalendarView if fetchBookedDates needs it
                // locationSlug={locationData.slug}
              />
            </div>
          </div>

          {/* Guest Selection */}
          <div>
            <label htmlFor="numGuestsOptionsModal" className="block text-lg font-semibold text-brand-text-dark mb-2">
              <FaUsers className="inline mr-2 text-brand-avocado" />Number of Guests
            </label>
            <select
              id="numGuestsOptionsModal"
              value={numGuests}
              onChange={handleNumGuestsChange}
              className="w-full p-3 border border-brand-border rounded-md focus:ring-1 focus:ring-brand-avocado focus:border-brand-avocado bg-white"
            >
              {guestOptions}
            </select>
            {numGuests > GUEST_LIMIT && (
              <p className="text-xs text-brand-text-secondary-dark mt-1">
                Note: Additional ₱{EXCESS_GUEST_FEE.toLocaleString()} per night for each guest over {GUEST_LIMIT}.
              </p>
            )}
          </div>

          {/* Real-time Pricing Display */}
          {numberOfNights > 0 && (
            <div className="p-4 bg-brand-bg-subtle rounded-lg border border-brand-border">
              <h4 className="text-md font-semibold text-brand-text-dark mb-2">Price Estimate</h4>
              <div className="space-y-1 text-sm text-brand-text-dark">
              <p><strong>Check-in:</strong> {formatDateDisplay(checkInDate)} at 12:00 PM</p>
              <p><strong>Check-out:</strong> {formatDateDisplay(checkOutDate)} at 11:00 AM</p>
                <p><strong>Nights:</strong> {numberOfNights}</p>
                <p><strong>Price per night:</strong> ₱{currentPricePerNight.toLocaleString()}</p>
                {guestSurcharge > 0 && (
                  <p><strong>Excess guest fee</strong> ({numGuests - GUEST_LIMIT} guest{numGuests - GUEST_LIMIT > 1 ? 's' : ''}): ₱{guestSurcharge.toLocaleString()}</p>
                )}
                <p className="text-lg font-bold mt-2">Estimated Total: ₱{estimatedTotalPrice.toLocaleString()}</p>
              </div>
            </div>
          )}
           {numberOfNights === 0 && (
             <p className="text-sm text-brand-text-secondary-dark text-center py-4">Select dates to see pricing details.</p>
           )}

          {/* House selection for Tagpopongan */}
          {locationData?.slug === 'tagpopongan' && checkInDate && checkOutDate && !isFullyBooked && (
            <div>
              <label className="block text-lg font-semibold text-brand-text-dark mb-2">Select House</label>
              {houseLoading ? (
                <p className="text-sm text-brand-text-secondary-dark">Loading available houses...</p>
              ) : houseError ? (
                <p className="text-sm text-red-600">{houseError}</p>
              ) : availableHouses.length > 0 ? (
                <select
                  className="w-full p-3 border border-brand-border rounded-md focus:ring-1 focus:ring-brand-avocado focus:border-brand-avocado bg-white mb-2"
                  value={selectedHouse || ''}
                  onChange={e => setSelectedHouse(Number(e.target.value))}
                >
                  {availableHouses.map(house => (
                    <option key={house} value={house}>House {house}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-red-600">No houses available for these dates.</p>
              )}
            </div>
          )}

          {/* Proceed Button */}
          <button
            onClick={handleProceedClick}
            className={`btn-primary btn-compact mt-4 ${isFullyBooked ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!checkInDate || !checkOutDate || isFullyBooked}
          >
            Payment Summary
          </button>

          {isFullyBooked && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm font-medium text-center">
                ⚠️ This date is not available. Please select a different date.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingOptionsMenuModal;
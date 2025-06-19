// client/src/components/CalendarView.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Base styles
import { fetchBookedDates } from '../services/api'; // Ensure this fetches {start: ISOString, end: ISOString}[]

// Custom hook to check window size
const useWindowSize = () => {
  const [size, setSize] = useState([
    typeof window !== 'undefined' ? window.innerWidth : 0,
    typeof window !== 'undefined' ? window.innerHeight : 0,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Guard for SSR or non-browser environments

    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on mount to set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures effect runs only on mount and unmount

  return size;
};

function CalendarView({
  checkInDate,          // User's current selection for start date (should be Date object or null)
  checkOutDate,         // User's current selection for end date (should be Date object or null)
  onDateChange,         // Callback function: (startDate, endDate) => void
  refreshTrigger,       // Prop to trigger re-fetch of availability (e.g., Date.now())
  locationSlug          // Prop for location-specific availability fetching
}) {
  const [bookedDateRanges, setBookedDateRanges] = useState([]); // Stores {start: Date, end: Date}
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [width] = useWindowSize();
  const isMobile = width < 768; // Adjust breakpoint as needed

  // Fetch booked dates when component mounts or when refreshTrigger/locationSlug changes
  useEffect(() => {
    const loadAvailability = async () => {
      console.log(`CalendarView: Fetching availability for location: '${locationSlug}', trigger: '${refreshTrigger}'`);
      setIsLoading(true);
      setError(null);
      try {
        // fetchBookedDates should return an array of objects:
        // { start: "ISO_STRING_UTC_CHECKIN_12PM", end: "ISO_STRING_UTC_CHECKOUT_11AM" }
        const rangesFromApi = await fetchBookedDates(locationSlug);

        // Convert ISO strings from API into local Date objects for react-datepicker
        const mappedRanges = rangesFromApi.map(range => {
          const start = new Date(range.start);
          const end = new Date(range.end);
          // It's crucial that these Date objects correctly represent the UTC moment
          // specified by the ISO strings.
          return { start, end };
        });

        setBookedDateRanges(mappedRanges);
        console.log("CalendarView: Processed bookedDateRanges (as local Date objects):",
          mappedRanges.map(r => ({
            start: r.start.toString(), // Log local string for easier reading
            end: r.end.toString()
          }))
        );
      } catch (err) {
        setError('Could not load availability data. Please try again later.');
        console.error("CalendarView: Error loading availability for " + locationSlug + ":", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch only if refreshTrigger is defined (prevents potential initial double fetch if key is undefined)
    if (typeof refreshTrigger !== 'undefined') {
      loadAvailability();
    } else {
      console.log("CalendarView: Initial render, refreshTrigger undefined, skipping initial fetch via trigger.");
      // Consider if an initial fetch is always needed on mount regardless of trigger
      // loadAvailability(); // Uncomment if you want initial fetch without waiting for trigger
    }
  }, [refreshTrigger, locationSlug]); // Dependencies for re-fetching

  // Callback for when the user selects dates in the DatePicker
  const handleDateChangeInternal = useCallback((dates) => {
    // `dates` is an array [startDate, endDate] from react-datepicker
    // These are Date objects, typically set to midnight of the selected day in local time
    const [start, end] = dates;
    onDateChange(start, end); // Pass these "day" selections to the parent component
  }, [onDateChange]);

  
  const isDayAvailable = (calendarDay) => {
    const dayStart = new Date(calendarDay);
    dayStart.setHours(0, 0, 0, 0);

    const dayEndMorning = new Date(calendarDay);
    dayEndMorning.setHours(11, 59, 59, 999);

    const dayStartMs = dayStart.getTime();
    const dayEndMorningMs = dayEndMorning.getTime();

    for (const range of bookedDateRanges) {
      const bookingStart = range.start.getTime();
      const bookingEnd = range.end.getTime();

      const overlapsMorning = bookingStart < dayEndMorningMs && bookingEnd > dayStartMs;

      if (overlapsMorning) {
        return false; // Gray this day out
      }
    }

    return true; // Allow booking this day
  };

  const dayClassName = (date) => {
  const localDateStr = date.toDateString();
    let isCheckIn = false;
    let isCheckOut = false;

  for (const range of bookedDateRanges) {
    const checkInStr = range.start.toDateString();
    const checkOutStr = range.end.toDateString();

    if (localDateStr === checkInStr) isCheckIn = true;
    if (localDateStr === checkOutStr) isCheckOut = true;
  }

  if (isCheckIn && isCheckOut) {
      return 'fully-booked'; // Will be red
    }
    
    // If it's a check-in or check-out day, mark it as partially booked
    if (isCheckIn || isCheckOut) {
      return 'partial-booked-checkin'; // Will be yellow
    }

  return ''; // Default class
  };

  // Prepare `excludeDateIntervals` for react-datepicker
  // This prop expects an array of objects { start: Date, end: Date }
  const excludeIntervals = useMemo(() => {
    return bookedDateRanges.map(range => {
      const { start, end } = range;
      // range.start and range.end are already local Date objects
      // representing the precise check-in (12 PM local -> UTC) and check-out (11 AM local -> UTC) times
      const adjustedEnd = new Date(end);
      adjustedEnd.setHours(0, 0, 0, 0); // Set to 12:00 AM of checkout day
      adjustedEnd.setMilliseconds(-1); // Subtract 1 minute
      
      console.log(`CalendarView UI: Excluding interval from ${range.start.toISOString()} to ${range.end.toISOString()}`);
      return {
          start: start, // The actual check-in time (Date object)
          end: adjustedEnd,      // The actual check-out time (Date object)
      };
    });
  }, [bookedDateRanges]); // Recalculate only when bookedDateRanges changes

  if (isLoading) {
    return <div className="text-center p-5 text-brand-text-secondary-dark">Loading availability...</div>;
  }

  if (error) {
    return <div className="text-center p-5 text-red-600">{error}</div>;
  }

  return (
    <DatePicker
      selected={checkInDate} // User's current selection for start (midnight local)
      onChange={handleDateChangeInternal}
      startDate={checkInDate}
      endDate={checkOutDate}  // User's current selection for end (midnight local)
      selectsRange
      inline
      monthsShown={isMobile ? 1 : 1}
      minDate={new Date(new Date().setHours(0,0,0,0))} // Disable selection of past days (start from today midnight)

      excludeDateIntervals={excludeIntervals} // Use precise time intervals
      //filterDate={isDayAvailable}

      // Setting these to true might make it behave more predictably with time-based exclusions
      // when selecting ranges, though needs testing with your specific react-datepicker version.
      // selectsStart
      // selectsEnd
      dayClassName={dayClassName}
      dateFormat="MM/dd/yyyy" // Common US date format
      placeholderText="Select your dates"
      preventOpenOnFocus
      disabledKeyboardNavigation
      // You can add a custom class for further styling if needed
      // calendarClassName="your-custom-calendar-class"
    />
  );
}

export default CalendarView;
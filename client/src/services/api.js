import axios from 'axios';

// Use the backend URL from environment variables if available, otherwise default
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.254.116:5001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Booking API Calls ---

export const fetchBookedDates = async (locationSlug = null) => {
  try {
    let url = '/sync/blocked-dates';
    if (locationSlug) {
      url += `?location=${encodeURIComponent(locationSlug)}`;
    }
    const response = await apiClient.get(url);
    // Response is an array of { start, end, status, source, location }
    return response.data.map(range => ({
      start: new Date(range.start),
        end: new Date(range.end)
      }));
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    throw error;
  }
};

export const submitBooking = async (bookingData) => {
  try {
    const response = await apiClient.post('/bookings', bookingData);
    return response.data; // Should return { success: true, data: booking } or { success: false, message: '...' }
  } catch (error) {
    console.error('Error submitting booking:', error.response?.data || error.message);
    // Throw a more specific error message if available from backend
    throw new Error(error.response?.data?.message || 'Booking submission failed');
  }
};

export const checkSpecificAvailability = async (checkInDate, checkOutDate, locationSlug) => {
  try {
    const response = await apiClient.post('/bookings/check-specific-availability', {
      checkInDate,
      checkOutDate,
      locationSlug
    });
    return response.data; // Returns { success: true, isAvailable: boolean, message: string }
  } catch (error) {
    console.error('Error checking specific availability:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to check availability');
  }
};

export const fetchAvailableHouses = async (location, checkInDate, checkOutDate) => {
  try {
    const response = await apiClient.post('/bookings/available-houses', {
      location,
      checkInDate,
      checkOutDate
    });
    if (response.data.success) {
      return response.data.availableHouses;
    } else {
      throw new Error(response.data.message || 'Failed to fetch available houses');
    }
  } catch (error) {
    console.error('Error fetching available houses:', error);
    throw error;
  }
};

// --- TODO: Add API calls for Admin actions ---
// export const fetchAllBookings = async () => { ... };
// export const updateBookingStatus = async (id, status) => { ... };
// etc.
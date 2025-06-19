// client/src/pages/PaymentOptionsPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Assuming Navbar is in ../components/
import Footer from '../components/Footer';   // Assuming Footer is in ../components/
import { submitBooking } from '../services/api'; // Import the API function to create the booking
import '../components/Sections.css'; // For .status-message, .btn-primary etc.

// Helper function to format dates (can be moved to a shared utils file)
const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput); // Ensure it's a Date object, handles ISO strings
  if (isNaN(date.getTime())) {
    console.warn("Invalid date passed to formatDate:", dateInput);
    return 'Invalid Date';
  }
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  try { return date.toLocaleDateString('en-US', options); }
  catch (error) { console.error("Error formatting date:", dateInput, error); return 'Error in Date'; }
};

function PaymentOptionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null); // Will hold all data from previous steps
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isConfirming, setIsConfirming] = useState(false); // For API call loading state
  const [confirmationStatus, setConfirmationStatus] = useState({ message: '', type: '' });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  useEffect(() => {
    if (location.state && location.state.bookingData) {
      console.log("PaymentOptionsPage received bookingData:", location.state.bookingData);
      // Validate crucial fields exist before setting state
      const { totalPrice, checkInDate, guestName, locationName } = location.state.bookingData;
      if (
        typeof totalPrice !== 'undefined' &&
        checkInDate && // Check if date strings are present
        guestName &&   // Check if user details are present
        locationName
      ) {
        setBookingDetails(location.state.bookingData);
      } else {
        console.error("PaymentOptionsPage: Crucial fields missing in received bookingData.", location.state.bookingData);
        setConfirmationStatus({ message: 'Essential booking information is incomplete. Please start over.', type: 'error' });
      }
    } else {
      console.error("No bookingData found in location.state for payment page.");
      setConfirmationStatus({ message: 'Booking details not found. Please start a new booking.', type: 'error' });
      // Optionally redirect after a delay:
      // setTimeout(() => navigate('/'), 5000);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (receiptFile) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      if (receiptFile.type.startsWith('image/')) {
        reader.readAsDataURL(receiptFile);
      } else {
        setReceiptPreview(null);
      }
    } else {
      setReceiptPreview(null);
    }
  }, [receiptFile]);

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setConfirmationStatus({ message: '', type: '' }); // Clear previous status messages
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    setReceiptFile(file);
  };

  const handleConfirmAndPay = async () => {
    if (!selectedPaymentMethod || !bookingDetails) {
        setConfirmationStatus({message: 'Please select a payment method before proceeding.', type: 'error'});
        return;
    }
    if (!receiptFile) {
        setConfirmationStatus({message: 'Please upload your payment receipt before proceeding.', type: 'error'});
        return;
    }
    setIsConfirming(true);
    setConfirmationStatus({ message: '', type: '' });

    // Prepare the final data object to send to the backend to create the booking
    const dataForBackend = {
        guestName: bookingDetails.guestName,
        guestEmail: bookingDetails.guestEmail,
        guestPhone: bookingDetails.guestPhone,
        specialRequests: bookingDetails.specialRequests,
        numberOfGuests: bookingDetails.numberOfGuests,
        checkInDate: bookingDetails.checkInDate,
        checkOutDate: bookingDetails.checkOutDate,
        location: bookingDetails.locationSlug,
        totalPrice: bookingDetails.totalPrice,
        downpaymentAmount: bookingDetails.downpaymentAmount,
        paymentMethod: selectedPaymentMethod,
        paymentStatus: 'pending_downpayment',
        houseNumber: bookingDetails.locationSlug === 'tagpopongan' ? bookingDetails.houseNumber : undefined,
    };

    try {
      const formData = new FormData();
      Object.entries(dataForBackend).forEach(([key, value]) => {
        if (typeof value !== 'undefined') formData.append(key, value);
      });
      formData.append('receipt', receiptFile);

      // Use fetch with the correct API URL
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();

      if (result && result.success && result.data?._id) {
        setConfirmationStatus({
            message: `Your booking for ${bookingDetails.locationName} (ID: ${result.data._id}) is tentatively reserved! Please follow the payment instructions for ${selectedPaymentMethod} to finalize your reservation. A confirmation email has been sent.`,
            type: 'success'
        });
      } else {
        setConfirmationStatus({ message: result?.message || 'Failed to create your booking record. Please try again.', type: 'error' });
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      setConfirmationStatus({ message: error?.message || 'An error occurred while attempting to create your booking. Please contact support.', type: 'error' });
    } finally {
      setIsConfirming(false);
    }
  };

  // Show loading/error if bookingDetails not yet set or critical data missing
  if (!bookingDetails || typeof bookingDetails.totalPrice === 'undefined') {
    return (
      <div className="bg-brand-bg-subtle min-h-screen text-brand-text-dark">
        <Navbar />
        <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-8 text-center"> {/* Adjust 160px based on nav/footer height */}
            <p className={`mb-4 text-lg ${confirmationStatus.type === 'error' ? 'text-red-600' : 'text-brand-text-secondary-dark'}`}>
                {confirmationStatus.message || "Loading booking details..."}
            </p>
            {(confirmationStatus.type === 'error' || !location.state?.bookingData) && (
                <Link to="/" className="btn-secondary px-8 py-3 text-base">Go to Homepage</Link>
            )}
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate downpayment (ensure calculatedTotalPrice is a number)
  const calculatedTotalPriceNum =  Number(bookingDetails.totalPrice) || 0;
  const downpaymentAmount = calculatedTotalPriceNum * 0.30;

  // Static payment instructions (replace with your actual details)
  const paymentInstructions = {
    GCash: `Please send your 30% downpayment (₱${downpaymentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}) to GCash number: 0912-345-6789 (Juan Dela Cruz).`,
    BPI: `Please send your 30% downpayment (₱${downpaymentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}) to BPI Account: \nName: Goldies Resort Inc. \nAccount No: 1234-5678-90.`,
    'Card (Placeholder)': `Please proceed to pay your 30% downpayment (₱${downpaymentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}) using your credit or debit card.`,
  };

  return (
    <div className="payment-options-page bg-brand-bg-subtle min-h-screen text-brand-text-dark">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 py-20 md:py-24">
        <div className="max-w-2xl mx-auto bg-brand-white p-6 md:p-8 rounded-xl shadow-xl border border-brand-border">
          <h1 className="text-3xl font-bold font-serif mb-2 text-center">Payment Details</h1>
          <p className="text-center text-brand-text-secondary-dark mb-8">Finalize your booking for {bookingDetails.locationName} by selecting a downpayment method.</p>

          {/* Booking Summary */}
          <div className="mb-8 p-4 border border-brand-border rounded-lg bg-brand-bg-subtle">
            <h2 className="text-xl font-semibold mb-3">Booking Summary</h2>
            <div className="space-y-1 text-sm">
                <p><strong>Location:</strong> {bookingDetails.locationName}</p>
                <p><strong>Check-in:</strong> {formatDate(bookingDetails.checkInDate)}</p>
                <p><strong>Check-out:</strong> {formatDate(bookingDetails.checkOutDate)}</p>
                <p><strong>Guests:</strong> {bookingDetails.numGuests || bookingDetails.numberOfGuests}</p> {/* Handle both potential prop names */}
                <p><strong>Nights:</strong> {bookingDetails.numberOfNights || 'N/A'}</p>
                {bookingDetails.locationSlug === 'tagpopongan' && bookingDetails.houseNumber && (
                  <p><strong>House:</strong> {bookingDetails.houseNumber}</p>
                )}
                <p className="mt-2">
                    <strong>Total Price:</strong> ₱{calculatedTotalPriceNum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <p className="text-lg font-bold text-brand-avocado">
                    <strong>30% Downpayment Due:</strong> ₱{downpaymentAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <p className="text-xs text-brand-text-secondary-dark mt-1">Remaining 70% balance (₱{(calculatedTotalPriceNum - downpaymentAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}) due upon arrival.</p>
            </div>
          </div>

          {/* Payment Method Selection */}
          {!confirmationStatus.message || confirmationStatus.type === 'error' ? ( // Show methods if no success message or if error
            <>
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Choose Payment Method for Downpayment</h2>
                <div className="space-y-3">
                {['GCash', 'BPI', 'Card (Placeholder)'].map((method) => (
                    <button
                    key={method}
                    onClick={() => handlePaymentMethodSelect(method)}
                    className={`w-full text-left p-4 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-avocado
                        ${selectedPaymentMethod === method ? 'bg-brand-avocado/10 border-brand-avocado ring-2 ring-brand-avocado' : 'bg-white hover:bg-brand-light-gray border-brand-border'}`}
                    >
                    {method}
                    </button>
                ))}
                </div>
            </div>

            {/* Receipt Upload */}
            {selectedPaymentMethod && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Upload Payment Receipt</h2>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleReceiptChange}
                  className="mb-2"
                />
                {receiptPreview && (
                  <div className="mb-2">
                    <img src={receiptPreview} alt="Receipt Preview" className="max-h-40 rounded border" />
                  </div>
                )}
                {receiptFile && !receiptPreview && (
                  <div className="mb-2 text-xs text-brand-text-secondary-dark">File selected: {receiptFile.name}</div>
                )}
              </div>
            )}

            {/* Payment Instructions */}
            {selectedPaymentMethod && paymentInstructions[selectedPaymentMethod] && (
                <div className="mb-8 p-4 border border-brand-xanthous bg-brand-xanthous/10 rounded-lg text-sm text-brand-text-dark">
                <h3 className="font-semibold mb-2 text-base">Instructions for {selectedPaymentMethod}:</h3>
                <p className="whitespace-pre-line">{paymentInstructions[selectedPaymentMethod]}</p>
                {selectedPaymentMethod === 'Card (Placeholder)' && <p className="text-xs mt-2 text-red-600 font-medium">Note: Credit/Debit Card payment is not actually implemented in this demonstration.</p>}
                </div>
            )}

            {/* Confirm Booking Button */}
            {selectedPaymentMethod && (
                <button
                    onClick={handleConfirmAndPay}
                    className="btn-primary w-full text-lg py-3"
                    disabled={isConfirming}
                >
                    {isConfirming ? 'Processing...' : `Confirm & Proceed with ${selectedPaymentMethod}`}
                </button>
            )}
            </>
          ) : null}


          {/* Confirmation Status Message (after attempting to book) */}
          {confirmationStatus.message && (
            <div className={`status-message ${confirmationStatus.type} mt-6 text-sm`}>
              {confirmationStatus.message}
            </div>
          )}

          {/* Link to go back home after successful tentative booking */}
          {confirmationStatus.type === 'success' && (
            <Link to="/" className="btn-secondary w-full text-center mt-4 block">Back to Homepage</Link>
          )}

          <p className="text-xs text-center text-brand-text-secondary-dark mt-8">
            Your selected dates are tentatively reserved once you click "Confirm & Proceed". Please follow the payment instructions to complete your downpayment within the specified timeframe (e.g., 24 hours) to fully secure your reservation. Failure to do so may result in cancellation of your tentative booking.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PaymentOptionsPage;
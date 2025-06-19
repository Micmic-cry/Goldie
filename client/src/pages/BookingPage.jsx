// client/src/pages/BookingPage.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// CalendarView is used inside BookingOptionsMenuModal
// import CalendarView from '../components/CalendarView';
import BookingForm from '../components/BookingForm';
import { submitBooking } from '../services/api'; // Assuming API functions exist
import '../components/Sections.css'; // Shared styles

// Import layout components
import ImageGallery from '../components/ImageGallery';
import AmenitiesSection from '../components/AmenitiesSection';
import LocationMap from '../components/LocationMap';
import BookingOptionsMenuModal from '../components/BookingOptionsMenuModal';
import BookingModal from '../components/BookingModal'; // This is the FINAL confirmation/details modal
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReviewsSection from '../components/ReviewsSection';
import AmenitiesModal from '../components/AmenitiesModal'; // For showing ALL amenities
import GalleryModal from '../components/GalleryModal';   // For showing ALL photos

// --- Import Icons ---
import { FaStar, FaShareSquare, FaHeart, FaCalendarCheck, FaMapMarkerAlt, FaShare } from 'react-icons/fa';

// --- LOCATION DATA (MOVE TO A SEPARATE FILE OR FETCH VIA API LATER) ---
const allLocationsData = {
  'tagaytay': {
    id: 'tagaytay', slug: 'tagaytay', name: "Tagaytay", title: "Serene Tagaytay Villa with Volcano Views",
    rating: 4.90, reviewsCount: 155, location: "Tagaytay, Cavite, Philippines", address: "123 View Point St, Tagaytay", pricePerNight: 6000,
    description: "Escape to the cool climate of Tagaytay. Our location offers breathtaking views of Taal Volcano, lush gardens, and cozy accommodations perfect for relaxation and romantic getaways. Enjoy private amenities and a serene atmosphere designed to make your stay unforgettable.", // Expanded description
    amenities: [ // Assuming amenityGroups structure for AmenitiesSection
        { title: 'Popular Amenities', items: [{ name: 'Air Conditioning', icon: 'AC' }, { name: 'Volcano View', icon: 'default' }, { name: 'Private Pool', icon: 'Pool' }, { name: 'Free Parking', icon: 'Parking' }] },
        { title: 'Comforts', items: [{ name: 'High-speed Wifi', icon: 'Wifi' }, { name: 'Full Kitchen', icon: 'Kitchen' }, { name: 'Patio or Balcony', icon: 'Patio'}, { name: 'Dedicated Workspace', icon: 'default'}] },
        { title: 'Entertainment & Outdoor', items: [{ name: 'Garden Access', icon: 'Garden'}, { name: 'Smart TV with Netflix', icon: 'TV'}, {name: 'Hot Tub', icon: 'default'}, {name: 'BBQ Area', icon: 'BBQ'} ]}
    ],
    images: [ '/images/location-tagaytay-placeholder.jpg', '/images/location-tagaytay-placeholder.jpg', '/images/location-tagaytay-placeholder.jpg', '/images/location-tagaytay-placeholder.jpg', '/images/location-tagaytay-placeholder.jpg', '/images/location-tagaytay-placeholder.jpg' ],
    googleMapsEmbedUrl: "YOUR_TAGAYTAY_EMBED_URL", googleMapsDirectionsUrl: "YOUR_TAGAYTAY_DIRECTIONS_URL",
  },
  'calinan': {
    id: 'calinan', slug: 'calinan', name: "Calinan", title: "Peaceful Calinan Retreat near Davao City",
    rating: 4.85, reviewsCount: 102, location: "Calinan, Davao City, Philippines", address: "Purok 2B, DAYAN BIAO, JOAQUIN...", pricePerNight: 12000,
    description: "Discover the charm of Calinan. Our resort offers comfortable amenities surrounded by lush greenery, perfect for families and relaxation seekers. The spacious grounds provide ample room for activities and unwinding.",
    amenities: [
        { title: 'Main Features', items: [ { name: 'Swimming Pool', icon: 'Pool' }, { name: 'BBQ Grill Available', icon: 'BBQ' }, {name:'Air Conditioning', icon: 'AC'}, {name: 'Free Parking', icon: 'Parking'} ] },
        { title: 'Connectivity & Entertainment', items: [{name: 'Reliable Wifi', icon: 'Wifi'}, {name: 'Cable TV', icon: 'TV'}, { name: 'Fully Equipped Kitchen', icon: 'Kitchen'}, { name: 'Outdoor Patio', icon: 'Patio'} ] },
        { title: 'Outdoor', items: [{ name: 'Lush Garden', icon: 'Garden'}, { name: 'Family Friendly', icon: 'default'}]}
    ],
    images: [ '/images/Front.jpg', '/images/PoolSide.jpg', '/images/Grill.jpg', '/images/Inside.jpg', '/images/Masters.jpg', '/images/Dining.jpg' ],
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126668.14465704665!2d125.34910889726565!3d7.197466299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f9150027ec5c01%3A0x721d00ce0a6466c0!2sGoldie's%20Inland%20Resort!5e0!3m2!1sen!2sph!4v1746331251106!5m2!1sen!2sph",
    googleMapsDirectionsUrl: "YOUR_CALINAN_DIRECTIONS_URL",
   },
  'tagpopongan': {
    id: 'tagpopongan', slug: 'tagpopongan', name: "Golden - Tagpopongan", title: "Golden - Tagpopongan: Scenic Volcano Views & Cool Breezes",
    rating: 4.9, reviewsCount: 87, location: "Tagpopongan, Island Garden City of Samal, Philippines", address: "Tagpopongan, IGaCoS, Davao del Norte", pricePerNight: 14000,
    description: "Cool breezes and scenic volcano views await. Enjoy a relaxing stay at Golden - Tagpopongan with modern amenities, a beautiful pool, and lush surroundings.",
    amenities: [
        { title: 'Main Features', items: [ { name: 'Swimming Pool', icon: 'Pool' }, { name: 'BBQ Grill Available', icon: 'BBQ' }, {name:'Air Conditioning', icon: 'AC'}, {name: 'Free Parking', icon: 'Parking'} ] },
        { title: 'Connectivity & Entertainment', items: [{name: 'Reliable Wifi', icon: 'Wifi'}, {name: 'Cable TV', icon: 'TV'}, { name: 'Fully Equipped Kitchen', icon: 'Kitchen'}, { name: 'Outdoor Patio', icon: 'Patio'} ] },
        { title: 'Outdoor', items: [{ name: 'Lush Garden', icon: 'Garden'}, { name: 'Family Friendly', icon: 'default'}]}
    ],
    images: [ '/images/Tagpopongan.jpg', '/images/Tagpopongan2.jpg', '/images/Tagpopongan3.jpg', '/images/Tagpopongan4.jpg', '/images/Tagpopongan5.jpg', '/images/Tagpopongan6.jpg' ],
    googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63340.624374268344!2d125.77995718209742!3d7.150376393296259!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x32f967005dd430b3%3A0xfb921766f10becda!2sGolDen%20Sanctuary%20Beach%20Resort!5e0!3m2!1sen!2sph!4v1749796079101!5m2!1sen!2sph",
    googleMapsDirectionsUrl: "YOUR_TAGPOPOGAN_DIRECTIONS_URL",
  },
};
// --- End Location Data ---

// Constants for pricing logic
const WEEKDAY_PRICE_OVERRIDE = 12000;
const WEEKEND_PRICE_OVERRIDE = 10000;
const GUEST_LIMIT = 10;
const EXCESS_GUEST_FEE = 350;

// Helper function
const formatDate = (date) => {
  if (!date) return '';
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  try { return new Date(date).toLocaleDateString('en-US', options); }
  catch (error) { console.error("Error formatting date:", date, error); return 'Invalid Date'; }
};

function BookingPage() {
  // --- State for selected options (from Options Modal) ---
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState(null);
  const [selectedNumGuests, setSelectedNumGuests] = useState(1);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);
  const [selectedNumberOfNights, setSelectedNumberOfNights] = useState(0);
  const [selectedHouseNumber, setSelectedHouseNumber] = useState(null);

  // --- Other Page State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({ message: '', type: '' });
  const [isBookingOptionsModalOpen, setIsBookingOptionsModalOpen] = useState(false);
  const [isConfirmBookingModalOpen, setIsConfirmBookingModalOpen] = useState(false); // For the form modal
  const [locationData, setLocationData] = useState(null);
  const [errorLoading, setErrorLoading] = useState(false);
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  // --- Hooks ---
  const { locationSlug } = useParams();
  const navigate = useNavigate();

  // --- Effects ---
  useEffect(() => {
    console.log("Booking page loading for slug:", locationSlug);
    const normalizedSlug = locationSlug ? locationSlug.toLowerCase() : null;
    const data = normalizedSlug ? allLocationsData[normalizedSlug] : null;
    if (!normalizedSlug || !data) { // Handle direct /book or invalid slug
        setErrorLoading(true); setLocationData(null);
        console.error("No valid location slug provided or data not found for booking page:", locationSlug);
        return;
    }
    if (data) {
      setLocationData(data);
      setErrorLoading(false);
      // Reset selections when location changes
      setSelectedCheckIn(null); setSelectedCheckOut(null); setSelectedNumGuests(1); setCalculatedTotalPrice(0); setSelectedNumberOfNights(0);
      setIsBookingOptionsModalOpen(false); setIsConfirmBookingModalOpen(false);
      setBookingStatus({ message: '', type: '' });
    }
  }, [locationSlug, navigate]);

  // --- Modal Handlers ---
  const openBookingOptionsModal = () => setIsBookingOptionsModalOpen(true);
  const closeBookingOptionsModal = () => setIsBookingOptionsModalOpen(false);

  const openConfirmBookingModal = () => setIsConfirmBookingModalOpen(true);
  const closeConfirmBookingModal = () => {
    setIsConfirmBookingModalOpen(false);
    // Clear submission errors when manually closing confirm modal
    if (bookingStatus.type === 'error') {
        setBookingStatus({message: '', type: ''});
    }
  };

  // Called from BookingOptionsMenuModal when "Proceed" is clicked
  const handleOptionsSelected = useCallback((optionsFromModal) => {
    console.log("BookingPage: handleOptionsSelected received:", optionsFromModal);
    setSelectedCheckIn(new Date(optionsFromModal.checkInDate));
    setSelectedCheckOut(new Date(optionsFromModal.checkOutDate));
    setSelectedNumGuests(optionsFromModal.numGuests);
    setCalculatedTotalPrice(optionsFromModal.calculatedTotalPrice);
    setSelectedNumberOfNights(optionsFromModal.numberOfNights);
    setSelectedHouseNumber(optionsFromModal.houseNumber || null);

    closeBookingOptionsModal();
    openConfirmBookingModal(); // Open the final confirmation modal with the form
  }, [closeBookingOptionsModal, openConfirmBookingModal]);

  // Triggered by BookingForm's onSubmit inside the CONFIRMATION modal
const handleFinalFormSubmit = useCallback(async (formDataFromDetailsForm) => {
    // This function is called when the user submits the form in the "Confirm Your Details" modal.
    // It now *collects* all data and navigates to the payment page.
    // The actual database record creation will be initiated from the PaymentOptionsPage.

    if (!selectedCheckIn || !selectedCheckOut || !locationData) {
        console.error("handleFinalFormSubmit: Missing essential data (dates/location).");
        setBookingStatus({ message: 'Error: Session details missing. Please try again.', type: 'error' });
        // Keep modal open to show error or close and let user restart.
        return;
    }

    // We are not submitting to backend YET, so set isSubmitting to false or handle UI differently
    // setIsSubmitting(true); // Only set this when actually calling an async API

    // 1. Prepare all booking data to be passed to the PaymentOptionsPage
    const finalCheckInDate = new Date(selectedCheckIn);
    finalCheckInDate.setHours(12, 0, 0, 0);
    const finalCheckOutDate = new Date(selectedCheckOut);
    finalCheckOutDate.setHours(11, 0, 0, 0);

    console.log("BookingPage: Value of selectedNumGuests before sending:", selectedNumGuests);
    const bookingDataForPaymentPage = {
        // Details from the form user just filled
        ...formDataFromDetailsForm, // guestName, guestEmail, guestPhone, specialRequests, houseNumber
        // Details selected in the first modal (BookingOptionsMenuModal)
        numberOfGuests: selectedNumGuests,
        checkInDate: finalCheckInDate.toISOString(),
        checkOutDate: finalCheckOutDate.toISOString(),
        locationName: locationData.name,
        locationSlug: locationData.slug,
        totalPrice: calculatedTotalPrice, // This is the total for the stay
        downpaymentAmount: calculatedTotalPrice * 0.30,
        numberOfNights: selectedNumberOfNights,
        houseNumber: locationData.slug === 'tagpopongan' ? selectedHouseNumber : undefined,
        // No tentativeBookingId yet, as no DB record has been created.
    };

    console.log("BookingPage: All details collected, navigating to /payment-options with:", bookingDataForPaymentPage);

    closeConfirmBookingModal(); // Close the details form modal
    navigate('/payment-options', { state: { bookingData: bookingDataForPaymentPage } });

}, [
    selectedCheckIn, selectedCheckOut, selectedNumGuests, locationData,
    calculatedTotalPrice, selectedNumberOfNights,
    closeConfirmBookingModal, navigate
]);

  const openAmenitiesModal = useCallback(() => setIsAmenitiesModalOpen(true), []);
  const closeAmenitiesModal = useCallback(() => setIsAmenitiesModalOpen(false), []);
  const openGalleryModal = useCallback(() => setIsGalleryModalOpen(true), []);
  const closeGalleryModal = useCallback(() => setIsGalleryModalOpen(false), []);
  

   // --- Render Logic ---
   if (errorLoading) { return <div className='min-h-screen flex items-center justify-center text-center text-red-600 text-lg p-8'>Error: Location '{locationSlug}' not found or no location specified. <Link to="/" className='underline ml-2 font-semibold hover:text-red-800'>Go back home</Link></div>; }
   if (!locationData) { return <div className='min-h-screen flex items-center justify-center text-lg text-brand-text-secondary-dark'>Loading location details...</div>; }

  return (
    <div className="booking-page-layout bg-brand-white text-brand-text-dark">
        <Navbar />
        <main className="listing-page-container pt-24"> {/* Ensure sufficient padding-top */}

            {/* Listing Header */}
            <div className="listing-header pt-6">
                <h1 className="listing-title">{locationData.title || locationData.name}</h1>
                <div className="listing-subtitle">
                    <span><FaStar className="star-icon text-brand-xanthous"/> {locationData.rating?.toFixed(1)}</span>
                    <span className="separator">·</span>
                    <a href="#reviews" className="reviews-link text-brand-text-secondary-dark font-semibold">{locationData.reviewsCount} reviews</a>
                    <span className="separator">·</span>
                    <span className="location-link text-brand-text-secondary-dark font-semibold">{locationData.location}</span>
                    <div className="actions">
                        <button className="action-btn text-brand-text-dark"><FaShare /> Share</button>
                        <button className="action-btn text-brand-text-dark"><FaHeart /> Save</button>
                    </div>
                </div>
            </div>

            {/* Image Gallery */}
            <ImageGallery images={locationData.images || []} onShowAllClick={openGalleryModal} />

            {/* Main Content Area - Single Column with sections */}
            <div className="main-content-col-full-width mt-8"> {/* This class centers content */}
                {/* Host Info */}
                <div className="section-container host-info">
                    <h2 className="section-title">Hosted by Goldies Team</h2>
                    <p className='text-brand-text-dark'>Dedicated support • Local expertise for {locationData.name}</p>
                </div>
                {/* Description */}
                <div className="section-container description">
                    <h2 className="section-title">About this place</h2>
                    <p className='text-brand-text-dark leading-relaxed'>{locationData.description}</p>
                </div>
                {/* Amenities */}
                <div> {/* Wrapper for AmenitiesSection */}
                    <AmenitiesSection
                        amenityGroups={locationData.amenities || []}
                        onShowAllClick={openAmenitiesModal} // This triggers the amenities modal
                    />
                </div>

                {/* --- MAIN PAGE "CHECK AVAILABILITY" BUTTON --- */}
                <div className="section-container text-center py-8 md:py-12">
                    <button
                        onClick={openBookingOptionsModal} // Opens the BookingOptionsMenuModal
                        className="btn-primary text-xl px-10 py-4 inline-flex items-center gap-3"
                    >
                        <FaCalendarCheck />
                        Check Availability & Book
                    </button>
                </div>
            </div>

            {/* Map & Reviews */}
            <LocationMap resortName={locationData.name} address={locationData.address} googleMapsEmbedUrl={locationData.googleMapsEmbedUrl} />
            <ReviewsSection locationSlug={locationSlug} />

            {/* Page Level SUCCESS Message */}
            {bookingStatus.message && bookingStatus.type === 'success' && !isBookingOptionsModalOpen && !isConfirmBookingModalOpen && (
                <div className={`status-message ${bookingStatus.type} max-w-2xl mx-auto`}>{bookingStatus.message}</div>
            )}

            {/* Modals */}
            <BookingOptionsMenuModal
                isOpen={isBookingOptionsModalOpen}
                onClose={closeBookingOptionsModal}
                locationData={locationData}
                onProceedToPayment={handleOptionsSelected} // Renamed from onAvailabilityCheck
            />

            <BookingModal // Final Confirmation Modal (with form)
                isOpen={isConfirmBookingModalOpen}
                onClose={closeConfirmBookingModal}
                title={`Confirm Your Details for ${locationData.name}`}
            >
                {/* Summary of selected options */}
                <div className='mb-6 p-4 border border-brand-border rounded-lg bg-brand-bg-subtle text-brand-text-dark'>
                     <p><strong>Location:</strong> {locationData.name}</p>
                     <p><strong>Check-in:</strong> {formatDate(selectedCheckIn)} at 12:00 PM</p>
                     <p><strong>Check-out:</strong> {formatDate(selectedCheckOut)} at 11:00 AM</p>
                     <p><strong>Guests:</strong> {selectedNumGuests}</p>
                     <p><strong>Nights:</strong> {selectedNumberOfNights}</p>
                     {locationData.slug === 'tagpopongan' && selectedHouseNumber && (
                        <p><strong>House:</strong> {selectedHouseNumber}</p>
                     )}
                     <p className='font-bold mt-2 text-lg'>Total Price: ₱{calculatedTotalPrice.toLocaleString()}</p>
                     <p className='text-sm mt-1'>A 30% downpayment (₱{(calculatedTotalPrice * 0.30).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}) will be required on the next step.</p>
                 </div>
                 {/* Guest Details Form */}
                 <BookingForm
                    checkInDate={selectedCheckIn} // Pass for validation if BookingForm uses it
                    checkOutDate={selectedCheckOut}
                    initialGuestCount={selectedNumGuests} // Pre-fill guest count
                    onSubmit={handleFinalFormSubmit} // This will now lead to payment page
                    isSubmitting={isSubmitting}
                    showHouseSelect={false}
                 />
                 {/* Display errors from the form submission attempt */}
                 {bookingStatus.message && bookingStatus.type === 'error' && isConfirmBookingModalOpen && (
                    <p className="modal-error-message">{bookingStatus.message}</p>
                 )}
            </BookingModal>

            <AmenitiesModal isOpen={isAmenitiesModalOpen} onClose={closeAmenitiesModal} amenityGroups={locationData.amenities || []} />
            <GalleryModal isOpen={isGalleryModalOpen} onClose={closeGalleryModal} images={locationData.images || []} />
        </main>
        <Footer />
    </div>
  );
}

export default BookingPage;
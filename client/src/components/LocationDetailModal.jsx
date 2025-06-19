import React, { useEffect } from 'react';
import { FaTimes, FaArrowRight } from 'react-icons/fa'; // Icons
import { useNavigate } from 'react-router-dom'; // For navigation

function LocationDetailModal({ location, isOpen, onClose }) {
  const navigate = useNavigate();

  // Effect for Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Effect to prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup on unmount
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  if (!isOpen || !location) return null; // Don't render if not open or no location data

  // Prevent clicks inside content from closing modal
  const handleContentClick = (e) => e.stopPropagation();

  // Handle navigation to booking page
  const handleBookNow = () => {
    console.log('Book Now clicked for:', location); // <<<--- Add Log 1
    const slug = location.slug || location.name.toLowerCase().replace(/\s+/g, '-');
    const targetPath = `/book/${slug}`;
    console.log('Navigating to:', targetPath); // <<<--- Add Log 2
    onClose(); // Close the modal first
    navigate(targetPath); // <<<--- Ensure this line is called with the correct path
  };

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      onClick={onClose} // Click overlay to close
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-brand-white text-brand-text-dark rounded-xl shadow-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={handleContentClick}
      >
        {/* Header Section with Image */}
        <div className="relative h-64 md:h-80">
            {/* Feature Image */}
          <img
            src={location.featureImage || '/images/placeholder-large.jpg'}
            alt={`Featured view of ${location.name}`}
            className="absolute inset-0 w-full h-full object-cover rounded-t-xl"
          />
           {/* Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
           {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition-colors"
                aria-label="Close details"
            >
                <FaTimes size={18}/>
            </button>
             {/* Title on Image */}
             <h2 className="absolute bottom-4 left-6 text-3xl md:text-4xl font-bold text-white font-serif z-10">
                {location.name}
             </h2>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 flex-grow">
          {/* Description */}
          <p className="text-base md:text-lg text-brand-text-secondary mb-6 leading-relaxed">
            {location.fullDescription || 'Detailed description about this wonderful location goes here, highlighting its unique features and attractions.'}
          </p>

          {/* Gallery/Highlights Section */}
          {location.galleryImages && location.galleryImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Highlights</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {location.galleryImages.map((imgUrl, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow">
                    <img
                      src={imgUrl}
                      alt={`${location.name} highlight ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder for more details like amenities */}
          {/* <div className="mb-6"> ... </div> */}

        </div>

         {/* Footer with Book Now Button */}
         <div className="p-6 md:p-8 border-t border-brand-light-gray sticky bottom-0 bg-brand-white rounded-b-xl">
            <button onClick={handleBookNow} className="btn-primary w-full flex items-center justify-center gap-2 text-lg">
                <span>Book Now</span>
                <FaArrowRight />
            </button>
         </div>
      </div>
    </div>
  );
}

export default LocationDetailModal;
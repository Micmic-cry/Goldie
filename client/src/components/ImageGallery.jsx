// client/src/components/ImageGallery.jsx

import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { FaTh } from 'react-icons/fa';

// Import slick-carousel base styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import your custom section styles IF they contain overrides for slick or gallery layout
// If all styling is handled by Tailwind in this file, you might not need this.
// import './Sections.css';

// Custom hook to check window size (can be moved to a utils file)
const useWindowSize = () => {
  const [size, setSize] = useState([
    typeof window !== 'undefined' ? window.innerWidth : 0, // Initial width (SSR safe)
    typeof window !== 'undefined' ? window.innerHeight : 0 // Initial height (SSR safe)
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return; // Don't run effect on server

    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', handleResize);
    // Call handler right away so state is up-to-date
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty dependency array means only run on mount and unmount

  return size;
};


// Accept images array and the click handler for the button as props
function ImageGallery({ images = [], onShowAllClick }) { // Default images to empty array
  const [width] = useWindowSize();
  const isMobile = width < 768; // Mobile breakpoint (adjust if needed)

  // Placeholder if no images are provided
  if (!images || images.length === 0) {
    return (
      <div className="image-gallery-container bg-brand-light-gray rounded-xl flex items-center justify-center aspect-[16/9] max-h-[400px]">
        <p className="text-brand-text-secondary">No images available.</p>
      </div>
    );
  }

  // --- Settings for the mobile react-slick carousel ---
  const mobileSettings = {
    dots: true,         // Show dots navigation
    infinite: true,     // Loop the slides
    speed: 500,         // Transition speed in ms
    slidesToShow: 1,    // Show one image at a time
    slidesToScroll: 1,  // Scroll one image at a time
    autoplay: false,    // Usually disable autoplay for main gallery
    arrows: false,      // Hide arrows on mobile typically
    adaptiveHeight: true,
    // Custom dot styling using Tailwind within the element
    appendDots: dots => (
        <div>
            <ul className="absolute bottom-4 left-0 right-0 flex justify-center gap-2"> {dots} </ul>
        </div>
    ),
    customPaging: i => (
      <div className="w-2 h-2 bg-white/50 rounded-full transition-colors duration-200 slick-dot-inactive"></div> // Style inactive dots
      // Active dot styling is handled by slick-active class below
    )
  };

  // --- Desktop Grid Layout (show first 5 images) ---
  const desktopLayout = (
    <div className="image-gallery-grid">
      {/* Main Image */}
      <div
        className="grid-item main-image cursor-pointer"
        onClick={() => onShowAllClick && onShowAllClick(0)}
        title="View image 1"
      >
        <img src={images[0]} alt="Goldies Resort Main View" />
      </div>
      {/* Small Images (Indices 1 to 4) */}
      {images.slice(1, 5).map((imgUrl, index) => (
        <div
          key={index + 1}
          className={`grid-item small-image small-image-${index + 1} cursor-pointer`}
          onClick={() => onShowAllClick && onShowAllClick(index + 1)}
          title={`View image ${index + 2}`}
        >
          <img src={imgUrl} alt={`Goldies Resort View ${index + 2}`} />
        </div>
      ))}
      {/* "Show all photos" button */}
      {images.length > 5 && (
        <button
          onClick={() => onShowAllClick && onShowAllClick()}
          className="show-all-photos-btn"
        >
          <FaTh className="text-sm" />
          Show all photos
        </button>
      )}
    </div>
  );

  // --- Mobile Carousel Layout ---
  const mobileLayout = (
    // Added specific class for mobile overrides if needed
    <div className="image-gallery-carousel relative">
       <Slider {...mobileSettings}>
        {images.map((imgUrl, index) => (
          // Each slide container
          <div key={index} className="gallery-slide-mobile">
            {/* Image within the slide */}
            <img src={imgUrl} alt={`Goldies Resort View ${index + 1}`} />
          </div>
        ))}
      </Slider>
      {/* Add specific Tailwind overrides for active dots if needed */}
       <style jsx global>{`
        .image-gallery-carousel .slick-dots li.slick-active button > div {
           background-color: white !important; /* Style active dot */
        }
       `}</style>
    </div>
  );

  return (
    // Container styled in CSS (e.g., margin, border-radius, overflow)
    <div className="image-gallery-container">
      {/* Render different layout based on screen size */}
      {isMobile ? mobileLayout : desktopLayout}
    </div>
  );
}

export default ImageGallery;
// client/src/components/GalleryModal.jsx
import React, { useEffect } from 'react';
import Slider from 'react-slick';
import { FaTimes } from 'react-icons/fa';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Sections.css'; // Use shared styles

function GalleryModal({ isOpen, onClose, images }) {
    // ... (useEffect for Escape key and body scroll - same as BookingModal) ...
    useEffect(() => { /* Escape key handling */ }, [isOpen, onClose]);
    useEffect(() => { /* Body scroll handling */ }, [isOpen]);

    if (!isOpen || !images || images.length === 0) return null;

    const handleContentClick = (e) => e.stopPropagation();

    const settings = {
        dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1,
        adaptiveHeight: true, arrows: true, // Enable arrows
    };

    return (
        <div className={`modal-overlay gallery-modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
             {/* Close button outside the main content */}
             <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[1001] text-white bg-black/40 hover:bg-black/70 rounded-full p-2 transition-colors"
                aria-label="Close gallery"
            >
                <FaTimes size={22}/>
            </button>
            <div className="gallery-modal-content w-full max-w-5xl px-4" onClick={handleContentClick}>
                 <Slider {...settings}>
                    {images.map((imgUrl, index) => (
                    <div key={index} className="gallery-modal-slide">
                        <img src={imgUrl} alt={`Resort image ${index + 1}`} className="max-h-[85vh] w-auto mx-auto object-contain" />
                    </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
}

export default GalleryModal;
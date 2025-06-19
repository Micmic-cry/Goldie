import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa'; // Icon for close button
import './Sections.css'; // Reuse existing CSS file for modal styles

function BookingModal({ isOpen, onClose, title, children }) {

  // Effect to handle closing modal on Escape key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) { // 27 is the Escape key code
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    // Cleanup function to remove listener when component unmounts or modal closes
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]); // Re-run effect if isOpen or onClose changes

  // Prevent rendering if not open
  if (!isOpen) {
    return null;
  }

  // Prevent clicks inside the modal content from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Add 'open' class conditionally for CSS transitions
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className="modal-content" onClick={handleContentClick}>
        <div className="modal-header">
          <h3 className="modal-title">{title || 'Confirmation'}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          {children} {/* Render the content passed (e.g., the BookingForm) */}
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
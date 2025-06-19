// client/src/components/AmenitiesModal.jsx
import React, { useEffect } from 'react';
// VVVV --- IMPORT THE MISSING ICON (and others used in iconMap) --- VVVV
import {
    FaTimes,
    FaWifi,
    FaParking,
    FaSwimmingPool,
    FaUtensils,
    FaFan, // Keep this if 'AC' still uses it, or FaSnowflake
    FaTv,
    FaSmokingBan,
    FaShieldAlt,
    FaTree,
    FaBed,
    FaExclamationTriangle, // <<<--- ADD THIS IMPORT
    FaSnowflake // Make sure this is imported if 'AC' uses it
} from 'react-icons/fa';
import { GiBarbecue, GiGardeningShears } from 'react-icons/gi';
import { MdOutlineBathroom, MdOutlineOutdoorGrill } from 'react-icons/md';
// ^^^^ --- END ICON IMPORTS --- ^^^^

import './Sections.css'; // Use shared styles

// --- Re-declare or import iconMap ---
// Ensure all icons used here are imported above
const iconMap = {
    Wifi: FaWifi, Parking: FaParking, Pool: FaSwimmingPool, Kitchen: FaUtensils,
    AC: FaSnowflake, // Uses FaSnowflake
    BBQ: MdOutlineOutdoorGrill, Garden: FaTree, TV: FaTv,
    SmokingBan: FaSmokingBan, CarbonMonoxideAlarm: FaExclamationTriangle, // Uses FaExclamationTriangle
    SmokeAlarm: FaShieldAlt, Patio: GiGardeningShears, ExteriorCameras: FaShieldAlt,
    Bed: FaBed, Bathroom: MdOutlineBathroom,
    default: FaExclamationTriangle // Uses FaExclamationTriangle as fallback
};

function AmenitiesModal({ isOpen, onClose, amenityGroups }) {
    // ... (useEffect for Escape key and body scroll - same as BookingModal) ...
      useEffect(() => {
        const handleEsc = (event) => { if (event.keyCode === 27) onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
      }, [isOpen, onClose]);

      useEffect(() => {
        if (isOpen) { document.body.style.overflow = 'hidden'; }
        else { document.body.style.overflow = 'unset'; }
        return () => { document.body.style.overflow = 'unset'; }
      }, [isOpen]);

    if (!isOpen || !amenityGroups) return null;

    const handleContentClick = (e) => e.stopPropagation();

    // Flatten all amenities from groups
    const allAmenities = amenityGroups.flatMap(group => group.items);

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
            <div className="modal-content amenities-modal-content" onClick={handleContentClick}>
                <div className="modal-header">
                    <h3 className="modal-title">What this place offers</h3>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close amenities"> <FaTimes /> </button>
                </div>
                <div className="modal-body">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {allAmenities.map((amenity, index) => {
                             const IconComponent = iconMap[amenity.icon] || iconMap.default; // This uses the iconMap
                             return (
                                 <div key={index} className="flex items-center gap-4 py-1">
                                     <IconComponent className="text-xl text-brand-text-primary flex-shrink-0 w-6 text-center" />
                                     <span className="text-base text-brand-text-primary">{amenity.name}</span>
                                 </div>
                             );
                        })}
                     </div>
                </div>
            </div>
        </div>
    );
}

export default AmenitiesModal;
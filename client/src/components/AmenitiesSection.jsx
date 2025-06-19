// client/src/components/AmenitiesSection.jsx
import React from 'react';
import './Sections.css'; // Ensure your styles are here

// --- Import React Icons (or your icon components) ---
import {
    FaWifi, FaParking, FaSwimmingPool, FaUtensils, FaFan, FaTv,
    FaSmokingBan, FaExclamationTriangle, FaShieldAlt, FaTree,
    FaBed, FaShower, FaSnowflake // Example icons
} from 'react-icons/fa';
import { GiBarbecue, GiGardeningShears } from 'react-icons/gi';
import { MdOutlineBathroom, MdOutlineOutdoorGrill } from 'react-icons/md';


// --- Icon Mapping ---
const iconMap = {
    Wifi: FaWifi, Parking: FaParking, Pool: FaSwimmingPool, Kitchen: FaUtensils,
    AC: FaSnowflake, BBQ: MdOutlineOutdoorGrill, Garden: FaTree, TV: FaTv,
    SmokingBan: FaSmokingBan, CarbonMonoxideAlarm: FaExclamationTriangle,
    SmokeAlarm: FaShieldAlt, Patio: GiGardeningShears, ExteriorCameras: FaShieldAlt,
    Bed: FaBed, Bathroom: MdOutlineBathroom,
    default: FaExclamationTriangle
};

// Accept onShowAllClick prop
function AmenitiesSection({ amenityGroups = [], onShowAllClick }) { // Default amenityGroups to []
    if (!amenityGroups || amenityGroups.length === 0) {
        return (
            <div className="section-container amenities-section">
                <h2 className="section-title">What this place offers</h2>
                <p className="text-brand-text-secondary">No amenities listed for this location.</p>
            </div>
        );
    }

    // Flatten all items from all groups to get a single list of amenities
    const allAmenities = amenityGroups.flatMap(group => group.items);

    // Decide how many amenities to show initially before the "Show all" button
    const initialDisplayCount = 6; // Example: Show the first 6 amenities
    const displayedAmenities = allAmenities.slice(0, initialDisplayCount);

    // Determine if the "Show all" button should be visible
    const showShowAllButton = allAmenities.length > initialDisplayCount;

    return (
        <div className="section-container amenities-section">
            <h2 className="section-title">What this place offers</h2>
            <div className="amenities-grid">
                {/* Display the initially visible amenities */}
                {displayedAmenities.map((amenity, itemIndex) => {
                    const IconComponent = iconMap[amenity.icon] || iconMap.default;
                    return (
                        <div key={`displayed-${itemIndex}`} className="amenity-item">
                            <IconComponent className="amenity-icon" />
                            <span className="amenity-name">{amenity.name}</span>
                        </div>
                    );
                })}
            </div>

            {/* "Show all amenities" button - always rendered if there are more and handler exists */}
            {showShowAllButton && onShowAllClick && (
                <div className="mt-8 text-center"> {/* Added text-center for button alignment */}
                    <button
                        onClick={onShowAllClick} // Call the handler passed from BookingPage
                        className="show-all-amenities-btn" // Styled in Sections.css
                    >
                        Show all {allAmenities.length} amenities
                    </button>
                </div>
            )}
        </div>
    );
}

export default AmenitiesSection;
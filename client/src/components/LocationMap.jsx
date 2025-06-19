import React from 'react';
import './Sections.css';
import { FaMapMarkerAlt } from 'react-icons/fa'; // Import icon

function LocationMap({ resortName, address, googleMapsEmbedUrl, googleMapsDirectionsUrl }) {
  if (!googleMapsEmbedUrl) {
    return null;
  }

  return (
    <div className="section-container location-map-section">
      <h2 className="section-title">Where you'll be</h2>
       <div className="address-display-map">
         {/* Optional: Display address above map too */}
         {address && <p><FaMapMarkerAlt className="address-icon"/> {address}</p>}
       </div>
      <div className="map-container">
        <iframe
          src={googleMapsEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${resortName || 'the resort'}`}
        ></iframe>
      </div>
      {/* Removed address from below map as it's often above or just implied */}
      {/* Optional: Keep Directions link if needed */}
       {/* {googleMapsDirectionsUrl && (
           <a href={googleMapsDirectionsUrl} target="_blank" rel="noopener noreferrer" className="directions-link">
               Get directions
           </a>
       )} */}
    </div>
  );
}

export default LocationMap;
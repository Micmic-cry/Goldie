// client/src/components/LocationCard.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for client-side routing
import { FaArrowRight } from 'react-icons/fa';

// Change props back to imageUrl, name, description, link
function LocationCard({ imageUrl, name, description, link = "#", priceWeekday, priceWeekend }) {
  return (
    // Use Link component for client-side navigation
    <Link
      to={link} // Use the link prop for the destination
      className="block group rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out bg-brand-dark-gray/50 backdrop-blur-sm border border-white/10 transform hover:-translate-y-1"
    >
      <div className="relative h-72 overflow-hidden">
        {/* Price Tag */}
        {(priceWeekday && priceWeekend) && (
          <div className="absolute top-3 left-3 bg-brand-xanthous text-brand-space-cadet font-bold px-4 py-2 rounded-xl shadow text-xs z-10 text-left leading-tight">
            <div>₱{priceWeekday.toLocaleString()} <span className="font-normal">/ night</span> <span className="font-normal text-xs">(Mon-Thu)</span></div>
            <div>₱{priceWeekend.toLocaleString()} <span className="font-normal">/ night</span> <span className="font-normal text-xs">(Fri-Sun)</span></div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={`View of ${name}`}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6 text-white">
        <h3 className="text-2xl font-semibold font-serif mb-2">{name}</h3>
        <p className="text-base text-brand-text-muted mb-4">{description}</p>
        <span className="text-brand-xanthous font-semibold text-sm group-hover:underline inline-flex items-center gap-1">
          Explore Location
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
              <FaArrowRight size={12} />
          </span>
        </span>
      </div>
    </Link> // Changed back to Link
  );
}
export default LocationCard;
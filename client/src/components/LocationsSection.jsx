// client/src/components/LocationsSection.jsx

import React from 'react';
import LocationCard from './LocationCard'; // Make sure this component exists and accepts props

// --- SAMPLE LOCATION DATA ---
// IMPORTANT:
// 1. Replace placeholder image paths with actual paths in your `public/images/` folder.
// 2. Ensure the `slug` property is unique and matches what you expect in the URL (/book/slug).
const locationsData = [
  {
    id: 'Tagpopongan',         // Unique identifier
    slug: 'Tagpopongan',       // URL-friendly identifier
    name: "Golden - Tagpopongan",
    description: "Located on the beautiful island of Samal, Tagpopongan is surrounded by the sea—perfect for a true island escape.",
    imageUrl: "/images/Tagpopongan.jpg", // Path relative to /public
    priceWeekday: 12000,
    priceWeekend: 10000,
  },
  {
    id: 'calinan',
    slug: 'calinan',
    name: "Goldies - Calinan",
    description: "Your peaceful retreat near Davao City.",
    imageUrl: "/images/Front.jpg", // Replace with your actual Calinan image
    priceWeekday: 12000,
    priceWeekend: 10000,
  },
];
// --- End Sample Data ---

function LocationsSection() {
  // No modal state or handlers needed here anymore

  return (
    <section id="locations" className="py-16 md:py-24 bg-brand-space-cadet"> {/* Dark Background */}
      <div className="container mx-auto px-6">
        {/* Section Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-6 font-serif">
          Our Destinations
        </h2>
        {/* Section Subtitle */}
        <p className="text-center text-brand-text-muted text-lg max-w-2xl mx-auto mb-16">
          Experience unique tranquility at each of our distinct Goldies Inland Resort locations.
        </p>
        {/* Location Cards Grid */}
        <div className="flex justify-center"> {/* This div will center its inline-grid child */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12 lg:justify-center">
            {locationsData.map((location) => (
              <LocationCard
                key={location.id} // Use unique ID for key
                imageUrl={location.imageUrl}
                name={location.name}
                description={location.description}
                link={`/book/${location.slug}`}
                priceWeekday={location.priceWeekday}
                priceWeekend={location.priceWeekend}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocationsSection; // Ensure default export
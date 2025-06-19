import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import LocationsSection from '../components/LocationsSection';
import InspirationalSection from '../components/InspirationalSection';
import Footer from '../components/Footer';

function LandingPage() {
  return (
    <div className="landing-page bg-brand-space-cadet"> {/* Ensure base dark bg */}
      <Navbar />
      <main> {/* Wrap main content */}
        <HeroSection />
        <LocationsSection /> {/* id="locations" is implicitly handled by section tag */}
        <InspirationalSection />
        {/* Add placeholder div for "About" anchor link */}
        <div id="about"></div>
         {/* Add other sections like Gallery here */}
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
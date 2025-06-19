import React from 'react';
import { FaPlayCircle } from 'react-icons/fa';

function InspirationalSection() {
  return (
    <section className="relative py-24 md:py-40 text-white overflow-hidden">
       {/* Background Image */}
       <div className="absolute inset-0">
            <img src="/images/Tagpopongan.jpg" alt="Inspiring nature background" className="w-full h-full object-cover scale-110 blur-sm"/> {/* Slightly scaled & blurred */}
       </div>
       {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-space-cadet via-brand-space-cadet/80 to-brand-space-cadet/60"></div> {/* Gradient Overlay */}

      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif animate-fade-in-up">
          Relax, Reconnect, Recharge
        </h2>
        <p className="text-xl md:text-2xl text-brand-text-muted max-w-3xl mx-auto mb-12 [animation-delay:0.3s] animate-fade-in-up">
          Escape the everyday. Find your peace amidst nature's beauty at Goldies Inland Resort. Your perfect getaway is waiting.
        </p>
         {/* Optional Video Button */}
         {/* <button className="flex items-center gap-3 mx-auto text-brand-xanthous hover:text-brand-citrine text-lg transition-colors [animation-delay:0.6s] animate-fade-in-up">
            <FaPlayCircle className="text-4xl" />
            <span className="font-semibold tracking-wider">WATCH OUR STORY</span>
        </button> */}
      </div>
    </section>
  );
}
export default InspirationalSection;
import React from 'react';

function HeroSection() {
    return (
        <div className="relative h-screen min-h-[600px] flex items-center justify-center text-white overflow-hidden">
            {/* Background Image - Using Tailwind Class */}
            <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center animate-zoom-pan"></div>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60"></div> {/* Increased overlay darkness */}

            {/* Content */}
            <div className="relative z-10 text-center px-6 animate-fade-in-up">
                {/* Added delay utility classes directly */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-serif mb-4">
                    Visit Goldies Inland Resort
                </h1>
                <p className="text-xl md:text-2xl text-brand-text-muted max-w-xl mx-auto mb-10 [animation-delay:0.3s]"> {/* Use muted text color */}
                    Discover tranquility in Calinan and Tagpopongan.
                </p>
                <a href="#locations" className="btn-primary text-lg [animation-delay:0.6s]"> {/* Point to locations section */}
                    Explore Our Locations
                </a>
            </div>
        </div>
    );
}
export default HeroSection;
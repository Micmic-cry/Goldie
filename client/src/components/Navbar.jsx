import React, { useState, useEffect } from 'react';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import clsx from 'clsx'; // Import clsx
import './Sections.css';

function Navbar({ bgColor }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation(); // <<<--- Get location object

  // Determine if the current page requires dark text even when navbar is transparent
  // True for pages with light backgrounds (like /book), false for dark backgrounds (like /)
  const needsDarkTextOnTransparent = location.pathname.startsWith('/book');

  // Scroll detection effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // --- Determine final text/element colors ---
  // Text/Logo/Icons are dark IF (scrolled) OR (not scrolled AND on a page needing dark text)
  // OVERRIDE: If bgColor is set (admin page), always use dark text for contrast
  const forceDark = !!bgColor;
  const useDarkColorScheme = forceDark || isScrolled || (!isScrolled && needsDarkTextOnTransparent);

  // --- Define Classes ---
  // Navbar background: transparent or white based on scroll/menu open
  const navBgClass = bgColor || (isScrolled || mobileMenuOpen) ? 'bg-brand-white shadow-md' : 'bg-transparent';
  // Link color: dark or light based on the final color scheme decision
  const linkColorClass = useDarkColorScheme ? 'text-brand-text-dark hover:text-brand-avocado' : 'text-brand-text-light hover:text-brand-xanthous';
  // Logo color: dark or light based on the final color scheme decision
  const logoColorClass = useDarkColorScheme ? 'text-brand-space-cadet hover:text-brand-avocado' : 'text-white hover:text-brand-xanthous';
   // Mobile button color: dark or light based on the final color scheme decision
  const mobileButtonColorClass = useDarkColorScheme ? 'text-brand-space-cadet' : 'text-white';
  // Book Now button styles: different themes based on the final color scheme decision
  const bookNowBaseClass = "text-sm py-1.5 px-5 rounded-lg shadow-sm font-semibold transition-colors duration-200 ease-in-out transform hover:-translate-y-0.5";
  const bookNowColorClass = useDarkColorScheme ? 'bg-brand-avocado text-white hover:bg-brand-avocado-dark' : 'bg-brand-xanthous text-brand-space-cadet hover:brightness-110';


  return (
    <nav className={clsx(
      "fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ease-in-out",
      navBgClass // Apply dynamic background class
    )}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className={clsx("text-2xl font-bold font-serif transition-colors", logoColorClass)}>
          Goldies Resort
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Apply conditional link class */}
          <a href="/#locations" className={clsx("transition-colors font-medium", linkColorClass)}>Locations</a>
          <a href="/#about" className={clsx("transition-colors font-medium", linkColorClass)}>About</a>
          <a href="/#locations" className={clsx(bookNowBaseClass, bookNowColorClass)}>Book Now</a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className={clsx("text-2xl focus:outline-none", mobileButtonColorClass)}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

       {/* Mobile Menu Drawer - Always Dark Background */}
       <div className={clsx(
         "md:hidden absolute top-full left-0 right-0 bg-brand-space-cadet transition-max-height duration-500 ease-in-out overflow-hidden",
         mobileMenuOpen ? 'max-h-96 border-t border-white/10 shadow-lg' : 'max-h-0' // Toggle height based on state
       )}>
            {/* Mobile links always light */}
            <a href="/#locations" className="block px-6 py-3 text-brand-text-light hover:bg-white/5" onClick={closeMobileMenu}>Locations</a>
            <a href="/#about" className="block px-6 py-3 text-brand-text-light hover:bg-white/5" onClick={closeMobileMenu}>About</a>
            <Link to="/book" className="block px-6 py-3 text-brand-text-light hover:bg-white/5" onClick={closeMobileMenu}>Book Now</Link>
        </div>
    </nav>
  );
}
export default Navbar;
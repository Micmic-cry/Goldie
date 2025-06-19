import React from 'react';
// Import icons from react-icons
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn, FaYoutube } from 'react-icons/fa6';

function Footer({ minimal = false }) {
  if (minimal) {
    return (
      <footer className="bg-brand-space-cadet py-10 border-t border-white/10">
        <div className="container mx-auto px-6 text-center text-base text-brand-text-muted">
          <p>© {new Date().getFullYear()} Goldies Inland Resort. All Rights Reserved.</p>
        </div>
      </footer>
    );
  }
  return (
    <footer className="bg-brand-space-cadet py-10 border-t border-white/10">
      <div className="container mx-auto px-6 text-center text-base text-brand-text-muted flex flex-col md:flex-row md:justify-between md:items-center gap-8">
        {/* Left: Copyright */}
        <div>
          <p>© {new Date().getFullYear()} Goldies Inland Resort. All Rights Reserved.</p>
        </div>
        {/* Center: Connect & Contacts */}
        <div className="flex flex-col items-center gap-2">
          <span className="font-semibold text-white text-lg mb-1">Connect</span>
          <div className="flex gap-4 mb-2">
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-white text-xl"><FaFacebookF /></a>
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white text-xl"><FaInstagram /></a>
            <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:text-white text-xl"><FaXTwitter /></a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white text-xl"><FaLinkedinIn /></a>
            <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-white text-xl"><FaYoutube /></a>
          </div>
          <span className="font-semibold text-white text-lg mb-1">Contacts</span>
          <div className="text-brand-text-muted text-sm">
            <div>Phone: <a href="tel:+639123456789" className="hover:text-white">+63 912 345 6789</a></div>
            <div>Email: <a href="mailto:info@goldiesresort.com" className="hover:text-white">info@goldiesresort.com</a></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;

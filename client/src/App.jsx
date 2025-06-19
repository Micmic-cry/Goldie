// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BookingPage from './pages/BookingPage';
import PaymentOptionsPage from './pages/PaymentOptionsPage'; // <<<--- IMPORT
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/book" element={<BookingPage />} /> {/* General, might need better handling */}
        <Route path="/book/:locationSlug" element={<BookingPage />} />
        <Route path="/payment-options" element={<PaymentOptionsPage />} /> {/* <<<--- ADD ROUTE */}
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Optional: <Route path="/booking-confirmed/:bookingId" element={<ConfirmationPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App; 
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BookingPage from './pages/BookingPage';
// import AdminDashboard from './pages/AdminDashboard'; // Add later
// import Header from './components/Header'; // Add layout components
// import Footer from './components/Footer';

function App() {
  return (
    <Router>
      {/* <Header /> */}
      <div className="main-content"> {/* Optional wrapper */}
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/book" element={<BookingPage />} /> {/* Alias */}
          {/* <Route path="/admin" element={<AdminDashboard />} /> */} {/* Add admin route later */}
          {/* Add other routes (About, Contact, etc.) */}
        </Routes>
      </div>
      {/* <Footer /> */}
    </Router>
  );
}

export default App;
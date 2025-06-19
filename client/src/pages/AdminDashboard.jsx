import React, { useState, useEffect, useRef } from 'react';
import Footer from '../components/Footer';
import '../components/Sections.css';
import { io as socketIOClient } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const BACKEND_URL = API_URL.replace(/\/api$/, '');

function AdminDashboard() {
  // --- Auth State ---
  const [token, setToken] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // --- Bookings State ---
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filter, setFilter] = useState({ location: '', status: '', search: '' });
  const [exporting, setExporting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('calinan');
  const [toast, setToast] = useState(null);
  const socketRef = useRef(null);

  // --- Login Handler ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_URL}/bookings/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setToken(data.token);
        setUsername('');
        setPassword('');
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error');
    } finally {
      setLoginLoading(false);
    }
  };

  // --- Fetch Bookings ---
  const fetchBookings = () => {
    setLoading(true);
    setError('');
    fetch(`${API_URL}/bookings/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setBookings(data.data);
        else setError(data.message || 'Failed to fetch bookings');
      })
      .catch(() => { setError('Network error'); })
      .finally(() => { setLoading(false); });
  };

  // --- Filtered Bookings ---
  const filteredBookings = bookings.filter(b => {
    const matchesLocation = selectedLocation ? b.location === selectedLocation : true;
    const matchesStatus = filter.status ? b.status === filter.status : true;
    const matchesSearch = filter.search
      ? (b.guestName?.toLowerCase().includes(filter.search.toLowerCase()) || b.guestEmail?.toLowerCase().includes(filter.search.toLowerCase()))
      : true;
    return matchesLocation && matchesStatus && matchesSearch;
  });

  // --- Filter bookings for the selected location for summary stats
  const locationBookings = bookings.filter(b => !selectedLocation || b.location === selectedLocation);

  // --- Summary Statistics ---
  const getStatusCount = (status) => locationBookings.filter(b => b.status === status).length;
  const getTotalRevenue = () => locationBookings.reduce((sum, b) => {
    if (b.status === 'confirmed') return sum + (b.totalPrice || 0);
    if (b.status === 'downpayment_paid') return sum + (b.downpaymentAmount || 0);
    return sum;
  }, 0);

  const summaryCards = [
    {
      title: 'Pending Downpayment',
      count: getStatusCount('pending_downpayment'),
      color: 'bg-amber-50 border-amber-200',
      textColor: 'text-amber-700',
      icon: '⏳'
    },
    {
      title: 'Downpayment Paid',
      count: getStatusCount('downpayment_paid'),
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      icon: '💰'
    },
    {
      title: 'Confirmed',
      count: getStatusCount('confirmed'),
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      icon: '✅'
    },
    {
      title: 'Cancelled',
      count: getStatusCount('cancelled'),
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-700',
      icon: '❌'
    },
    {
      title: 'Total Revenue',
      count: `₱${getTotalRevenue().toLocaleString()}`,
      color: 'bg-gray-50 border-gray-200',
      textColor: 'text-gray-700',
      icon: '💵'
    }
  ];

  // --- Confirm Downpayment ---
  const handleConfirm = async (id) => {
    if (!window.confirm('Mark this booking as downpayment paid?')) return;
    try {
      await fetch(`${API_URL}/bookings/admin/${id}/confirm`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookings => bookings.map(b => b._id === id ? { ...b, status: 'downpayment_paid' } : b));
    } catch {
      alert('Failed to confirm downpayment.');
    }
  };

  // --- Confirm Full Payment ---
  const handleFullPayment = async (id) => {
    if (!window.confirm('Mark this booking as fully paid?')) return;
    try {
      await fetch(`${API_URL}/bookings/admin/${id}/fullpayment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookings => bookings.map(b => b._id === id ? { ...b, status: 'confirmed' } : b));
    } catch {
      alert('Failed to confirm full payment.');
    }
  };

  // --- Cancel Booking ---
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await fetch(`${API_URL}/bookings/admin/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(bookings => bookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch {
      alert('Failed to cancel booking.');
    }
  };

  // --- Export CSV ---
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API_URL}/bookings/admin/export`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bookings.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert('Failed to export CSV.');
    } finally {
      setExporting(false);
    }
  };

  // --- Booking Detail Modal ---
  const closeModal = () => setSelectedBooking(null);

  const getReceiptUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
  };

  // --- Socket.IO Connection ---
  useEffect(() => {
    if (!token) return;
    fetchBookings(); // Fetch bookings after login

    // Connect to Socket.IO server
    if (!socketRef.current) {
      socketRef.current = socketIOClient(API_URL.replace('/api', ''), {
        transports: ['websocket'],
        withCredentials: true
      });

      socketRef.current.on('bookingUpdated', (data) => {
        fetchBookings();
      });
      socketRef.current.on('bookingCreated', (data) => {
        setToast({ type: 'info', message: 'A new booking has been received!' });
        fetchBookings();
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  // --- Auto-Dismiss Toast ---
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- UI ---
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-900">Admin Login</h2>
                <p className="text-gray-600 mt-2">Access your dashboard</p>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    placeholder="Enter username" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    placeholder="Enter password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                
                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">{loginError}</p>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-medium transition-all duration-300 ${toast.type === 'info' ? 'bg-blue-600' : 'bg-green-600'}`}
          onClick={() => setToast(null)}
          role="alert"
          style={{ cursor: 'pointer' }}
        >
          {toast.message}
          <span className="ml-3 text-sm opacity-80">(Click to dismiss)</span>
        </div>
      )}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-56 h-screen bg-white border-r border-gray-200 pt-8 px-4 fixed top-0 left-0 z-10">
          <div className="flex flex-col items-center mb-8">
            {/* Replace with logo image if available, else use text */}
            <img src="/Logo(1).png" alt="Goldies Resort Logo" className="h-12 w-auto mb-2" />
            <span className="text-xl font-bold tracking-wide text-gray-800">Goldies Resort</span>
          </div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-6 tracking-widest">Locations</h2>
          <div className="flex flex-col gap-2">
            <button
              className={`w-full px-4 py-2 rounded-md text-left font-medium transition-colors ${selectedLocation === 'calinan' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedLocation('calinan')}
            >
              Calinan
            </button>
            <button
              className={`w-full px-4 py-2 rounded-md text-left font-medium transition-colors ${selectedLocation === 'tagpopongan' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedLocation('tagpopongan')}
            >
              Tagpopongan
            </button>
          </div>
        </aside>
        {/* Responsive sidebar for mobile */}
        <aside className="flex lg:hidden flex-row w-full bg-white border-b border-gray-200 py-2 px-2 justify-center gap-2 sticky top-16 z-10">
          <button
            className={`px-4 py-2 rounded-md font-medium transition-colors ${selectedLocation === 'calinan' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
            onClick={() => setSelectedLocation('calinan')}
          >
            Calinan
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium transition-colors ${selectedLocation === 'tagpopongan' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
            onClick={() => setSelectedLocation('tagpopongan')}
          >
            Tagpopongan
          </button>
        </aside>
        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-56">
          <main className="flex-1 container mx-auto px-4 sm:px-6 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600 mt-1">Manage bookings and monitor resort operations</p>
                </div>
                {/* Filters (remove location filter) */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <select 
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    value={filter.status} 
                    onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending_downpayment">Pending Downpayment</option>
                    <option value="downpayment_paid">Downpayment Paid</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                  <input 
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white" 
                    placeholder="Search guests..." 
                    value={filter.search} 
                    onChange={e => setFilter(f => ({ ...f, search: e.target.value }))} 
                  />
                  <button 
                    className="bg-gray-800 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={handleExport} 
                    disabled={exporting}
                  >
                    {exporting ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {summaryCards.map((card, index) => (
                <div 
                  key={index} 
                  className={`${card.color} ${card.textColor} rounded-lg border p-4`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-80">{card.title}</p>
                      <p className="text-2xl font-semibold mt-1">{card.count}</p>
                    </div>
                    <div className="text-2xl opacity-70">{card.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bookings Table (desktop/tablet) */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm align-middle">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[160px]">Guest</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[200px]">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      {selectedLocation === 'tagpopongan' && (
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">House</th>
                      )}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Check-in</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Check-out</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Downpayment</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={selectedLocation === 'tagpopongan' ? 10 : 9} className="text-center py-8 text-gray-500">Loading bookings...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={selectedLocation === 'tagpopongan' ? 10 : 9} className="text-center py-8">
                          <div className="text-red-600 bg-red-50 rounded-md p-3 mx-4">
                            <span className="font-medium">Error:</span> {error}
                          </div>
                        </td>
                      </tr>
                    ) : filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={selectedLocation === 'tagpopongan' ? 10 : 9} className="text-center py-8 text-gray-500">
                          <p className="text-lg font-medium">No bookings found</p>
                          <p className="text-sm">Try adjusting your filters</p>
                        </td>
                      </tr>
                    ) : filteredBookings.map(b => (
                      <tr 
                        key={b._id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors" 
                        onClick={() => setSelectedBooking(b)}
                      >
                        <td className="px-4 py-2 font-medium text-gray-900 max-w-[160px] truncate" title={b.guestName}>{b.guestName}</td>
                        <td className="px-4 py-2 text-gray-600 max-w-[200px] truncate" title={b.guestEmail}>{b.guestEmail}</td>
                        <td className="px-4 py-2"><span className="capitalize text-gray-700">{b.location}</span></td>
                        {selectedLocation === 'tagpopongan' && (
                          <td className="px-4 py-2 text-gray-600">{b.houseNumber || '-'}</td>
                        )}
                        <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{new Date(b.checkInDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{new Date(b.checkOutDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            b.status === 'downpayment_paid' ? 'bg-blue-100 text-blue-800' :
                            b.status === 'pending_downpayment' ? 'bg-yellow-100 text-yellow-800' :
                            b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {b.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-900 whitespace-nowrap">₱{b.downpaymentAmount?.toLocaleString() || '-'}</td>
                        <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">₱{b.totalPrice?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bookings Card List (mobile/tablet) */}
            <div className="lg:hidden space-y-4">
              {loading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <span className="text-gray-500">Loading bookings...</span>
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <div className="text-red-600 bg-red-50 rounded-md p-3">
                    <span className="font-medium">Error:</span> {error}
                  </div>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No bookings found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </div>
              ) : filteredBookings.map(b => (
                <div 
                  key={b._id} 
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer" 
                  onClick={() => setSelectedBooking(b)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{b.guestName}</h3>
                      <p className="text-sm text-gray-600">{b.guestEmail}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      b.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      b.status === 'downpayment_paid' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'pending_downpayment' ? 'bg-yellow-100 text-yellow-800' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-1 font-medium capitalize">{b.location}</span>
                    </div>
                    {selectedLocation === 'tagpopongan' && b.houseNumber && (
                      <div>
                        <span className="text-gray-500">House:</span>
                        <span className="ml-1 font-medium">{b.houseNumber}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Check-in:</span>
                      <span className="ml-1 font-medium">{new Date(b.checkInDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Check-out:</span>
                      <span className="ml-1 font-medium">{new Date(b.checkOutDate).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Downpayment:</span>
                      <span className="ml-1 font-medium">₱{b.downpaymentAmount?.toLocaleString() || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <span className="ml-1 font-medium">₱{b.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Booking Detail Modal */}
            {selectedBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
                      <button 
                        className="text-gray-400 hover:text-gray-600 transition-colors" 
                        onClick={closeModal}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Guest Name</label>
                          <p className="text-gray-900">{selectedBooking.guestName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-700">{selectedBooking.guestEmail}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-gray-700">{selectedBooking.guestPhone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Location</label>
                          <p className="text-gray-700 capitalize">{selectedBooking.location}</p>
                        </div>
                        {selectedBooking.location === 'tagpopongan' && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">House Number</label>
                            <p className="text-gray-700">{selectedBooking.houseNumber}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Check-in Date</label>
                          <p className="text-gray-700">{new Date(selectedBooking.checkInDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Check-out Date</label>
                          <p className="text-gray-700">{new Date(selectedBooking.checkOutDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Number of Guests</label>
                          <p className="text-gray-700">{selectedBooking.numberOfGuests}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            selectedBooking.status === 'downpayment_paid' ? 'bg-blue-100 text-blue-800' :
                            selectedBooking.status === 'pending_downpayment' ? 'bg-yellow-100 text-yellow-800' :
                            selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedBooking.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Total Price</label>
                          <p className="text-xl font-semibold text-gray-900">₱{selectedBooking.totalPrice?.toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Downpayment Amount</label>
                          <p className="text-lg font-medium text-gray-900">₱{selectedBooking.downpaymentAmount?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedBooking.specialRequests && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Special Requests</label>
                        <p className="text-gray-700 bg-gray-50 rounded-md p-3 mt-1">{selectedBooking.specialRequests}</p>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Created</label>
                          <p className="text-gray-700">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Last Updated</label>
                          <p className="text-gray-700">{new Date(selectedBooking.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Receipt Preview */}
                    {selectedBooking.receiptUrl && (
                      <div className="border-t pt-4">
                        <label className="text-sm font-medium text-gray-500">Payment Receipt</label>
                        <div className="mt-2">
                          {selectedBooking.receiptUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img 
                              src={getReceiptUrl(selectedBooking.receiptUrl)} 
                              alt="Receipt" 
                              className="max-h-48 rounded-md border cursor-pointer" 
                              onClick={() => window.open(getReceiptUrl(selectedBooking.receiptUrl), '_blank', 'noopener,noreferrer')}
                            />
                          ) : selectedBooking.receiptUrl.match(/\.pdf$/i) ? (
                            <a 
                              href={getReceiptUrl(selectedBooking.receiptUrl)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                              View PDF Receipt
                            </a>
                          ) : (
                            <a 
                              href={getReceiptUrl(selectedBooking.receiptUrl)} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                              Download Receipt
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions at the bottom */}
                    <div className="border-t pt-6 mt-6 flex flex-wrap gap-3 justify-end">
                      {selectedBooking.receiptUrl && (
                        <button 
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1" 
                          onClick={() => window.open(getReceiptUrl(selectedBooking.receiptUrl), '_blank', 'noopener,noreferrer')}
                          title="View Receipt"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1.5 12s3.5-7 10.5-7 10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          View Receipt
                        </button>
                      )}
                      {selectedBooking.status === 'pending_downpayment' && (
                        <button 
                          className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors" 
                          onClick={() => handleConfirm(selectedBooking._id)}
                        >
                          Confirm
                        </button>
                      )}
                      {selectedBooking.status === 'downpayment_paid' && (
                        <button 
                          className="text-green-700 hover:text-green-900 text-sm font-medium transition-colors" 
                          onClick={() => handleFullPayment(selectedBooking._id)}
                        >
                          Confirm Full Payment
                        </button>
                      )}
                      {selectedBooking.status !== 'cancelled' && (
                        <button 
                          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors" 
                          onClick={() => handleCancel(selectedBooking._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
          <Footer minimal />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 
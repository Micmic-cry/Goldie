const ical = require('node-ical');
const fetch = require('node-fetch');
const icalGen = require('ical-generator');
const Booking = require('../models/Booking');

// Import Airbnb iCal and block dates in your system
exports.importAirbnbICal = async (req, res) => {
  const { icalUrl } = req.body;
  if (!icalUrl) return res.status(400).json({ error: 'Missing iCal URL' });

  try {
    const response = await fetch(icalUrl);
    const icalData = await response.text();
    const events = ical.parseICS(icalData);

    let blockedCount = 0;
    for (const key in events) {
      const event = events[key];
      if (event.type === 'VEVENT') {
        // Upsert a "blocked" booking for these dates
        await Booking.updateOne(
          { checkInDate: event.start, checkOutDate: event.end, status: 'blocked', source: 'airbnb' },
          {
            $set: {
              checkInDate: event.start,
              checkOutDate: event.end,
              status: 'blocked',
              source: 'airbnb',
              guestName: 'Airbnb Guest',
              location: event.location || 'Airbnb',
            }
          },
          { upsert: true }
        );
        blockedCount++;
      }
    }
    res.json({ message: `Imported and blocked ${blockedCount} Airbnb bookings.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import iCal', details: err.message });
  }
};

// Export your bookings as iCal
exports.exportICal = async (req, res) => {
  const calendar = icalGen({ name: 'Goldies Resort Bookings' });
  const bookings = await Booking.find({ status: { $in: ['confirmed', 'pending_downpayment', 'blocked'] } });

  bookings.forEach(booking => {
    calendar.createEvent({
      start: booking.checkInDate,
      end: booking.checkOutDate,
      summary: `Booking: ${booking.guestName || 'Guest'}`,
      description: `Guests: ${booking.numberOfGuests || ''}`,
      location: booking.location || '',
    });
  });

  res.setHeader('Content-Type', 'text/calendar');
  calendar.serve(res);
};

// Get all blocked dates (Airbnb + confirmed/pending bookings)
exports.getBlockedDates = async (req, res) => {
  try {
    const { location } = req.query;
    const query = {
      status: { $in: ['confirmed', 'pending_downpayment', 'blocked'] }
    };
    if (location) {
      query.location = location;
    }
    const bookings = await Booking.find(query, 'checkInDate checkOutDate status source location');
    res.json(bookings.map(b => ({
      start: b.checkInDate,
      end: b.checkOutDate,
      status: b.status,
      source: b.source,
      location: b.location
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blocked dates', details: err.message });
  }
}; 
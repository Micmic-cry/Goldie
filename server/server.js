const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const bookingRoutes = require('./routes/bookingRoutes');
const icalRoutes = require('./routes/icalRoutes');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
// Optional: Error handling middleware
// const { errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://192.168.254.116:5173'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});
app.set('io', io);

// --- Middleware ---
// Enable CORS for React frontend (adjust origin for production)

const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.254.116:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    return callback(null, true); // Allow all origins (for dev only)
  },
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
}));

// Body parser middleware to handle JSON payloads
app.use(bodyParser.json());
// If using URL-encoded forms (less common with React/JSON APIs)
// app.use(bodyParser.urlencoded({ extended: false }));

// Serve uploaded receipts statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Routes ---
app.get('/', (req, res) => res.send('Goldies Resort API Running')); // Simple test route
app.use('/api/bookings', bookingRoutes);
app.use('/api/sync', icalRoutes);
// Add other routes here (e.g., /api/auth for admin login)


// --- Optional: Custom Error Handling ---
// app.use(errorHandler);


const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
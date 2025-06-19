const express = require('express');
const { importAirbnbICal, exportICal, getBlockedDates } = require('../controllers/icalController');
const router = express.Router();

router.post('/import-airbnb', importAirbnbICal);
router.get('/export', exportICal);
router.get('/blocked-dates', getBlockedDates);

module.exports = router; 
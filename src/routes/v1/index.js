const express = require('express');
const airplaneRoutes = require('./airplane-routes.js');
const authRoutes = require('./auth-routes');
const flightRoutes = require('./flight-routes');

const router = express.Router();

// Authentication routes
router.use('/auth', authRoutes);

// Resource routes
router.use('/airplanes', airplaneRoutes);
router.use('/flights', flightRoutes);

module.exports = router;

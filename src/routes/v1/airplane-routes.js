const express = require('express');
const { AirplaneController } = require('../../controllers/index.js');
const { AirplaneMiddlewares } = require('../../middlewares');

const router = express.Router();

router.post(
  '/',
  [AirplaneMiddlewares.validateCreateAndUpdateAirplane],
  AirplaneController.createAirplane,
);

router.get(
  '/',
  AirplaneController.getAirplanes,
);

module.exports = router;

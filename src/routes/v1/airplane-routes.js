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

router.get(
  '/:id',
  AirplaneController.getAirplane,
);

router.put(
  '/:id',
  [AirplaneMiddlewares.validateCreateAndUpdateAirplane],
  AirplaneController.updateAirplane,
);

router.delete(
  '/:id',
  AirplaneController.deleteAirplane,
);

module.exports = router;

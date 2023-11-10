const express = require('express');

const router = express.Router();

const controller = require('../controllers/notification.controller');

router.post('/initiate', controller.initiateNotification);
router.post('/push', controller.pushNotification);
router.post('/verify', controller.verifyNotification);
router.post('/enroll', controller.enrollNotification);

module.exports = router;

const express = require('express');

const router = express.Router();

const controller = require('../controllers/v2.0.controller');

router.get('/schema-attributes', controller.schemaAttributes);

router.get('/me', controller.me);

router.patch('/userInfo/:id', controller.updateUserInfo);

router.delete('/userInfo/:id', controller.deleteUser);

router.get('/factors/:type', controller.getEnrollments);

router.delete('/factors/:type/:id', controller.deleteEnrollments);

router.get('/PasswordPolicies', controller.PasswordPolicies);

module.exports = router;

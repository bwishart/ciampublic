const express = require('express');

const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets/config');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

const controller = require('../controllers/v1.0.controller');

router.get('/attributes', controller.getAttributes);

router.delete('/authenticators', controller.deleteAuthenticators);

router.get('/authnmethods/signatures', controller.authnmethods);

router.post('/attributes', controller.postAttributes);

router.post('/themes', upload.any(), controller.postThemes);

router.put('/themes', upload.any(), controller.putThemes);

router.get('/themes', controller.getThemes);

module.exports = router;

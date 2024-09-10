const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { predictImage, getPredictionsByUserId } = require('../controller/PredictControler');
const authenticate = require('../Middleware/Auth');

router.post('/predict', upload.single('image'), predictImage);
router.get('/predict', getPredictionsByUserId, authenticate);

module.exports = router;
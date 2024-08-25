const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { predictImage } = require('../controller/PredictControler');


router.post('/predict', upload.single('image'), predictImage);

module.exports = router;
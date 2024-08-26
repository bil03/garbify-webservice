const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(), // Menyimpan file di memori
  limits: { fileSize: 1 * 1024 * 1024 }, // Maksimal 1MB
});
const { create, getById } = require('../controller/SampahControler');

router.get('/detail/:id', getById);
router.post('/create', upload.single('image'), create);

module.exports = router;

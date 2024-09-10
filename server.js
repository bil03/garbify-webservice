require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const RouterPredict = require('./routes/Predict');
const RouterSampah = require('./routes/Sampah');
const InputError = require('./exception/InputError');

const app = express();

// Middleware
app.use(express.static(__dirname));
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Middleware untuk parsing URL-encoded body

// Rute
app.use('/models', RouterPredict);
app.use('/sampah', RouterSampah);

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof InputError) {
    return res.status(err.statusCode).json({
      status: 'fail',
      message: `${err.message}`,
    });
  }
  if (err.status) {
    return res.status(err.status).json({
      status: 'fail',
      message: err.message,
    });
  }
  next(err);
});

// Error Handling Middleware untuk Internal Server Error
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    status: 'fail',
    message: 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');

const RouterPredict = require('./routes/predict');
const InputError = require('./exception/InputError');

const app = express();

app.use('/models', RouterPredict);

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

app.use((err, req, res, next) => {
  if (err instanceof InputError) {
    res.status(err.statusCode).json({
      status: 'fail',
      message: `${err.message}`,
    });
  } else if (err.status) {
    res.status(err.status).json({
      status: 'fail',
      message: err.message,
    });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    status: 'fail',
    message: 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

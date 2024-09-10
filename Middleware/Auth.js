const admin = require('firebase-admin'); // Untuk verifikasi token Firebase
const InputError = require('../exception/InputError');

async function authenticate(req, res, next) {
  try {
    // Memverifikasi token Firebase dari header Authorization
    const token = req.headers.authorization && req.headers.authorization.split('Bearer ')[1];
    if (!token) {
      throw new InputError('No authentication token provided', 401);
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token); // Verifikasi token
    } catch (error) {
      throw new InputError('Invalid token', 401);
    }

    // Menyimpan userId di request untuk diakses di controller
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    next(new InputError(error.message || 'Authentication error', error.statusCode || 401));
  }
}

module.exports = authenticate;

const { predictImageClassification } = require('../services/PredictService');
const InputError = require('../exception/InputError');
const Predict = require('../models/Predict');
const { bucket } = require('../config/FirebaseConfig');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin'); // Untuk verifikasi token Firebase

async function predictImage(req, res, next) {
  try {
    const id = uuidv4();
    const image = req.file;

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

    const userId = decodedToken.uid; // Dapatkan userId dari token

    if (!image || !image.buffer) {
      throw new InputError('No image file provided', 400);
    }

    if (image.size > 1000000) {
      throw new InputError('File size exceeds 1MB', 413);
    }

    // Membuat path file di bucket
    const fileName = `${image.originalname}-${Date.now()}`;
    const folderName = 'predict';

    const filePath = `${folderName}/${fileName}`;
    const file = bucket.file(filePath);

    try {
      const predictions = await predictImageClassification(req.file.buffer.toString('base64'));

      // Menyimpan file ke Firebase Storage
      await file.save(image.buffer, {
        metadata: { contentType: image.mimetype },
      });
      await file.makePublic(); // Membuat file publik (opsional)

      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      const labelMapping = {
        kertas: { type: 'Anorganik', recycleStatus: 'Ya' },
        plastik: { type: 'Anorganik', recycleStatus: 'Ya' },
        kaca: { type: 'Anorganik', recycleStatus: 'Ya' },
        logam: { type: 'Anorganik', recycleStatus: 'Ya' },
        sepatu: { type: 'Anorganik', recycleStatus: 'Tidak' },
        pakaian: { type: 'Anorganik', recycleStatus: 'Tidak' },
        baterai: { type: 'Anorganik', recycleStatus: 'Tidak' },
        'sisa-makanan': { type: 'Organik', recycleStatus: 'Tidak' },
      };

      // Format data prediksi
      const formattedPredictions = predictions.displayNames.map((name, index) => ({
        id: id, // Gunakan ID yang sama untuk semua prediksi
        userId: userId,
        imageUrl: imageUrl,
        name: name,
        type: labelMapping[name]?.type || 'Unknown',
        recycleStatus: labelMapping[name]?.recycleStatus || 'Unknown',
      }));

      // Simpan prediksi ke Firestore
      await Predict.Save({
        id: id,
        userId: userId,
        imageUrl: imageUrl,
        predictions: formattedPredictions,
      });

      res.json({
        predictionResult: formattedPredictions,
      });
    } catch (error) {
      console.error('Error in prediction service:', error);
      return next(new InputError(error.message || 'Error occurred', error.statusCode || 500));
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    next(new InputError(error.message || 'Unexpected error', error.statusCode || 500));
  }
}

async function getPredictionsByUserId(req, res, next) {
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

    const userId = decodedToken.uid; // Dapatkan userId dari token

    // Mengambil data prediksi berdasarkan userId
    const predictions = await Predict.findByUserId(userId);

    if (predictions.length === 0) {
      // Mengembalikan pesan jika data tidak ada
      return res.status(404).json({
        message: 'Data tidak tersedia',
      });
    }

    // Mengembalikan hasil dalam format yang diinginkan
    res.json({
      predictionResult: predictions.map((prediction) => ({
        id: prediction.id,
        userId: prediction.userId,
        imageUrl: prediction.imageUrl,
        ...prediction.predictions,
      })),
    });
  } catch (error) {
    console.error('Error retrieving predictions:', error);
    next(new InputError(error.message || 'Error occurred', error.statusCode || 500));
  }
}

module.exports = {
  predictImage,
  getPredictionsByUserId,
};

// const fs = require('fs');
// const crypto = require('crypto');
// const base64Img = require('base64-img');
const { predictImageClassification } = require('../services/predictService');
const InputError = require('../exception/InputError');

async function predictImage(req, res, next) {
  try {
    // Pastikan bahwa file diunggah dengan benar
    if (!req.file || !req.file.buffer) {
      throw new InputError('No image file provided', 400);
    }

    // Konversi buffer ke base64
    const imageBase64 = req.file.buffer.toString('base64');

    if (req.file.size > 1000000) {
      throw new InputError('File size exceeds 1MB', 413);
    }
    try {
      // Kirim permintaan ke layanan prediksi
      const predictions = await predictImageClassification(imageBase64);

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

      const formattedPredictions = predictions.displayNames.map((label, index) => {
        const { type, recycleStatus } = labelMapping[label] || { type: 'Unknown', recycleStatus: 'Unknown' };
        return {
          name: label,
          type,
          recycleStatus,
          // confidence: predictions.confidences[index],
        };
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

module.exports = {
  predictImage,
};

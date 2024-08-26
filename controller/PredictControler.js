const { predictImageClassification } = require('../services/PredictService');
const InputError = require('../exception/InputError');

async function predictImage(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      throw new InputError('No image file provided', 400);
    }

    const imageBase64 = req.file.buffer.toString('base64');

    if (req.file.size > 1000000) {
      throw new InputError('File size exceeds 1MB', 413);
    }
    try {
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

      const formattedPredictions = predictions.displayNames.map((label) => {
        const { type, recycleStatus } = labelMapping[label] || { type: 'Unknown', recycleStatus: 'Unknown' };
        return {
          name: label,
          type,
          recycleStatus,
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

const axios = require('axios');
const { execSync } = require('child_process');

async function predictImageClassification(imageBase64) {
  const endpoint = process.env.ENDPOINT;

  const requestPayload = {
    instances: [
      {
        content: imageBase64,
      },
    ],
    parameters: {
      confidenceThreshold: 0.15,
      maxPredictions: 5,
    },
  };

  const accessToken = execSync('gcloud auth print-access-token').toString().trim();

  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.post(endpoint, requestPayload, options);
    return response.data.predictions[0];
  } catch (error) {
    throw new Error(`Error saat mengirim permintaan prediksi: ${error.message}`);
  }
}

module.exports = {
  predictImageClassification,
};

const { db } = require('../config/FirebaseConfig');

class Predict {
  constructor(id, userId, imageUrl, name, type, recycleStatus) {
    this.id = id;
    this.userId = userId;
    this.imageUrl = imageUrl;
    this.name = name;
    this.type = type;
    this.recycleStatus = recycleStatus;
  }

  static Save = async ({ id, userId, imageUrl, predictions }) => {
    try {
      if (!id || !userId || !imageUrl || !Array.isArray(predictions)) {
        throw new Error('Invalid data provided');
      }

      await db.collection('predict').doc(id).set({
        userId,
        imageUrl,
        predictions,
      });
    } catch (error) {
      console.error('Error saving prediction data:', error);
      throw error;
    }
  };

  static findByUserId = async (userId) => {
    const snapshot = await db.collection('predict').where('userId', '==', userId).get();
    if (snapshot.empty) {
      return [];
    }

    const predictions = [];
    snapshot.forEach((doc) => {
      predictions.push({ id: doc.id, ...doc.data() });
    });

    return predictions;
  };
}

module.exports = Predict;

const { db } = require('../config/FirebaseConfig');

class Sampah {
  constructor(id, imageUrl, category, type, recyclable, description, handling1, handling2) {
    this.id = id;
    this.imageUrl = imageUrl;
    this.category = category;
    this.type = type;
    this.recyclable = recyclable;
    this.description = description;
    this.handling1 = handling1;
    this.handling2 = handling2;
  }

  static Save = async (sampah) => {

    const { id, imageUrl, category, type, recyclable, description, handling1, handling2 } = sampah;

    await db.collection('sampah').doc(id).set({
      imageUrl,
      category,
      type,
      recyclable,
      description,
      handling1,
      handling2,
    });
  };

  static findById = async (id) => {
    const doc = await db.collection('sampah').doc(id).get();
    if (!doc.exists) {
      throw new Error('Sampah not found');
    }

    const data = doc.data();
    return data;
  }
}

module.exports = Sampah;

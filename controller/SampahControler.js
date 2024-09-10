const { bucket } = require('../config/FirebaseConfig');
const Sampah = require('../models/Sampah');
const { v4: uuidv4 } = require('uuid');
const InputError = require('../exception/InputError');

async function create(req, res, next) {
  try {
    const { category, type, recyclable, description, handling1, handling2 } = req.body;
    const id = uuidv4();
    const image = req.file;

    // Validasi file gambar
    if (!image || !image.buffer) {
      throw new InputError('No image file provided', 400);
    }
    if (image.size > 1000000) {
      throw new InputError('File size exceeds 1MB', 413);
    }

    // Validasi input
    if (!category) {
      throw new InputError('Category is required!', 400);
    }
    if (!type) {
      throw new InputError('Type is required!', 400);
    }
    if (!recyclable) {
      throw new InputError('Recyclable is required!', 400);
    }
    if (!description) {
      throw new InputError('Description is required!', 400);
    }
    if (!handling1) {
      throw new InputError('Handling is required!', 400);
    }
    if (!handling2) {
      throw new InputError('Handling is required!', 400);
    }

    // Membuat path file di bucket
    const fileName = `${image.originalname}-${Date.now()}`;
    const folderName = 'sampah';

    const filePath = `${folderName}/${fileName}`;
    const file = bucket.file(filePath);

    try {
      // Menyimpan file ke Firebase Storage
      await file.save(image.buffer, {
        metadata: { contentType: image.mimetype },
      });
      await file.makePublic(); // Membuat file publik (opsional

      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      // Membuat objek sampah baru
      const sampah = {
        id: id,
        imageUrl: imageUrl,
        category: category,
        type: type,
        recyclable: recyclable,
        description: description,
        handling1: handling1,
        handling2: handling2,
      };

      // Simpan objek sampah ke database
      await Sampah.Save(sampah);

      // Mengirimkan response sukses
      return res.status(200).json({
        status: 'Success',
        message: 'Successfully created sampah!',
        sampah: sampah,
      });
    } catch (error) {
      console.error('Error create sampah', error);
      return next(new InputError(error.message || 'Unexpected error', error.statusCode || 500));
    }
  } catch (error) {
    console.error('Error in create function:', error);
    return next(new InputError(error.message || 'Unexpected error', error.statusCode || 500));
  }
}

const getById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const sampah = await Sampah.findById(id);
    return res.status(200).json({
      status: 'Success',
      message: 'Successfully get sampah!',
      sampah: sampah,
    });
  } catch (error) {
    console.error('Sampah Not Found', error);
    return next(new InputError(error.message || 'Unexpected error', error.statusCode || 500));
  }
};

module.exports = { getById, create };

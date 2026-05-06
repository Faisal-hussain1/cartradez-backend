const cloudinary = require('cloudinary').v2;
const config = require('config');

const {FILE_NOT_FOUND} = require('../constants/file');
const logger = require('../middleware/loggerMiddleware');

// Helper function to ensure Cloudinary is configured
function ensureCloudinaryConfigured() {
  cloudinary.config({
    cloud_name: config.get('cloudinaryCloudName'),
    api_key: config.get('cloudinaryApiKey'),
    api_secret: config.get('cloudinaryApiSecret'),
  });
}

module.exports.uploadFile = async ({filePath, file, fileName}) => {
  try {
    ensureCloudinaryConfigured();
    // Upload file to Cloudinary from buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'cartradez', // Store in 'cartradez' folder
          public_id: filePath.replace(/\//g, '_'), // Use filePath as public_id
          resource_type: 'auto', // Auto-detect resource type
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    });

    return {url: result.secure_url, key: result.public_id};
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

module.exports.deleteFile = async ({key}) => {
  try {
    ensureCloudinaryConfigured();
    // Delete file from Cloudinary
    await cloudinary.uploader.destroy(key, {resource_type: 'image'});
    return {key};
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

module.exports.getFile = async ({key}) => {
  try {
    ensureCloudinaryConfigured();
    // Get file info from Cloudinary
    const result = await cloudinary.api.resource(key);
    
    if (!result) {
      return {url: null, key, error: FILE_NOT_FOUND};
    }

    return {url: result.secure_url, key};
  } catch (err) {
    if (err.http_code === 404) {
      return {url: null, key, error: FILE_NOT_FOUND};
    }
    logger.error(err);
    throw err;
  }
};

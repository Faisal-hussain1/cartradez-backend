const {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const {Upload} = require('@aws-sdk/lib-storage');
const config = require('config');

const {FILE_NOT_FOUND} = require('../constants/file');
const logger = require('../middleware/loggerMiddleware');

const accessKeyId = config.get('awsAccessKey');
const secretAccessKey = config.get('awsSecretAccessKey');
const Bucket = config.get('awsBucket');
const region = config.get('awsBucketRegion');

const client = new S3Client({
  region,
  credentials: {accessKeyId, secretAccessKey},
});

module.exports.uploadFile = async ({filePath, file, fileName}) => {
  try {
    const upload = new Upload({
      client,
      params: {
        Bucket,
        Key: filePath,
        Body: file.buffer,
      },
    });

    const data = await upload.done();

    return {url: data.Location, key: fileName};
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

module.exports.deleteFile = async ({key}) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket,
      Key: key,
    });
    await client.send(command);

    return {key};
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

module.exports.getFile = async ({key}) => {
  try {
    const command = new HeadObjectCommand({
      Bucket,
      Key: key,
    });
    await client.send(command); // Check if the file exists
    const encoded = encodeURIComponent(key);
    const fileUrl = `https://${Bucket}.s3.${region}.amazonaws.com/${encoded}`;

    return {url: fileUrl, key};
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return {url: null, key, error: FILE_NOT_FOUND};
    }
    throw err;
  }
};

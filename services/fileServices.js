const {fileUtils} = require('../utils');

module.exports = class FileServices {
  static async uploadSingleFile({file, fileDir, key = null}) {
    const fileName = key ? key : file.originalname;

    const fileObj = await fileUtils.uploadFile({
      filePath: `${fileDir}/${fileName}`,
      file,
      fileName,
    });

    return fileObj;
  }

  static async deleteFile({key}) {
    const result = await fileUtils.deleteFile({
      key,
    });

    return result;
  }
};

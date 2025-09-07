const path = require('path');

const multer = require('multer');

const {GeneralErrorsFactory} = require('../factories');

// Define the middleware function that accepts options
module.exports = ({
  allowedTypes = [], // Default to allow all types if not specified
  fileSizeLimit = 5 * 1024 * 1024, // 5 MB limit
  require = true, // Default to require a file upload if not specified
  multiple = false, // Default to single file upload if not specified
}) => {
  // Use memory storage to keep files in memory
  const storage = multer.memoryStorage();

  // Define a file filter based on allowed file types
  const fileFilter = (req, file, cb) => {
    const timestamp = Date.now(); // Get the current timestamp
    const fileExtension = path.extname(file.originalname); // Extract the file extension

    let filenameWithoutExtension = path.basename(
      file.originalname,
      path.extname(file.originalname)
    ); // Extract the filename without extension

    const filename = `${filenameWithoutExtension}.${timestamp}${fileExtension}`; // Concatenate the timestamp and file extension
    file.originalname = filename; // Set the new filename with timestamp

    // Check if the file type is allowed
    if (!allowedTypes.length || allowedTypes.includes(file.mimetype)) {
      // Allow the file upload if it is an allowed type or if no types are restricted
      cb(null, true);
    } else {
      // Reject the file upload if it is not an allowed type
      return cb(
        GeneralErrorsFactory.fileTypeNotAllowedErr({
          allowedTypes: allowedTypes.join(', '),
        }),
        false
      );
    }
  };

  // Create a Multer instance with storage in memory, file filter, and limits
  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: fileSizeLimit},
  });

  // Return a middleware function that handles both single and multiple file uploads
  return (req, res, next) => {
    // Determine the upload function based on the `multiple` option
    const uploadFn = multiple ? upload.array('files') : upload.single('file');

    // Invoke the upload function
    uploadFn(req, res, (err) => {
      if (err) {
        // If an error occurs during file upload, pass it to the error handler
        return next(err);
      }
      if (multiple) {
        if ((!req.files || req.files.length === 0) && require)
          return next(GeneralErrorsFactory.fileNotFoundErr());
      } else if (!req.file && require)
        return next(GeneralErrorsFactory.fileNotFoundErr());

      // Proceed to the next middleware or controller if the file upload is successful
      req.body = JSON.parse(JSON.stringify(req.body));
      next();
    });
  };
};

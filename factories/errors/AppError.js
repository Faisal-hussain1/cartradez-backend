class AppError extends Error {
  constructor({message, statusCode, error = null} = {}) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isKnown = true;
    this.internalErr = error;
  }
}
module.exports = AppError;

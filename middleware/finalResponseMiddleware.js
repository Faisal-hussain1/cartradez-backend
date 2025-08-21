module.exports = (data, req, res, next) => {
  const header = {
    'Content-Type': 'application/json',
  };

  return res.status(data.statusCode).set(header).json(data);
};

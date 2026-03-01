// module.exports = (data, req, res, next) => {
//   const header = {
//     'Content-Type': 'application/json',
//   };

//   return res.status(data.statusCode).set(header).json(data);
// };

module.exports = (data, req, res, next) => {
  // Agar plain JS error aa jaye
  if (!data) {
    return res.status(500).json({
      statusCode: 500,
      message: 'Unknown server error',
    });
  }

  // Agar statusCode na ho → default 500
  const statusCode =
    typeof data.statusCode === 'number' ? data.statusCode : 500;

  const header = {
    'Content-Type': 'application/json',
  };


  return res
    .status(statusCode)
    .set(header)
    .json({
      statusCode,
      message: data.message || 'Internal server error',
      ...(data.body && {data: data.body}),
      ...(data.code && {code: data.code}),
    });
};

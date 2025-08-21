const mongoose = require('mongoose');
const Yup = require('yup');

module.exports.mongooseIdValidate = ({name, required = true}) => {
  const schema = Yup.string();
  if (required) schema.required(`${name} ID is required`);

  return schema.test({
    name: 'Id validation',
    message: `Invalid ${name} id`,
    test: (value) => (value ? mongoose.Types.ObjectId.isValid(value) : true),
  });
};

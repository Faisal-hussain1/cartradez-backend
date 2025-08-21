const Yup = require('yup');

const {validatorUtils} = require('../utils');

const commonEntitySchema = {
  title: Yup.string().required(),
};

const validateCreateEntityBody = ({data: entity}) => {
  const schema = Yup.object().shape({
    ...commonEntitySchema,
  });

  return validatorUtils.validate({schema, data: entity});
};

const validateUpdateEntityBody = ({data: entity}) => {
  const schema = Yup.object().shape({
    ...commonEntitySchema,
  });

  return validatorUtils.validate({schema, data: entity});
};

const validateEntityIdParams = ({data: entity}) => {
  const schema = Yup.object().shape({
    _id: validatorUtils.mongooseIdValidate({name: 'Entity'}),
  });

  return validatorUtils.validate({schema, data: entity});
};

const validateUpdateManyEntitiesBody = ({data: entities}) => {
  const schema = Yup.object().shape({
    ids: Yup.array()
      .of(validatorUtils.mongooseIdValidate({name: 'Entity'}))
      .min(1, 'At least one ID must be provided')
      .required(),
    data: Yup.object()
      .shape({
        ...commonEntitySchema,
      })
      .required(),
  });

  return validatorUtils.validate({schema, data: entities});
};

const validateDeleteManyEntitiesBody = ({data: entities}) => {
  const schema = Yup.object().shape({
    ids: Yup.array()
      .of(validatorUtils.mongooseIdValidate({name: 'Entity'}))
      .min(1, 'At least one ID must be provided')
      .required(),
  });

  return validatorUtils.validate({schema, data: entities});
};

module.exports = {
  validateCreateEntityBody,
  validateEntityIdParams,
  validateUpdateEntityBody,
  validateUpdateManyEntitiesBody,
  validateDeleteManyEntitiesBody,
};

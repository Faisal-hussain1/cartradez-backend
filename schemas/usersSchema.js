const Yup = require('yup');

const {usersConstants} = require('../constants');
const {validatorUtils} = require('../utils');

const commonAuthSchema = {
  email: Yup.string()
    .email()
    .required('Email is required')
    .test('email', 'Email is not valid', (value) => {
      // This custom regex test enhances email validation to address limitations in the default Yup validation, which fails to catch certain invalid email formats like "test@test" or "test@test.c".
      return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value);
    }),
  password: Yup.string()
    .required('Password is required')
    .min(
      8,
      'Must contain at least 8 characters and at least 1 uppercase letter'
    )
    .matches(
      /[A-Z]/,
      'Must contain at least 8 characters and at least 1 uppercase letter'
    ),
  firstName: Yup.string().min(1).max(255).required('First name is required'),
  lastName: Yup.string().min(1).max(255).required('Last name is required'),
};

module.exports.validateCreateRequest = ({data: user}) => {
  const schema = Yup.object().shape({
    ...commonAuthSchema,
    role: Yup.string().oneOf(usersConstants.SYSTEM_ROLES_VALUES),
  });

  return validatorUtils.validate({schema, data: user});
};

module.exports.validateLoginRequest = ({data: user}) => {
  const schema = Yup.object().shape({
    email: commonAuthSchema.email,
    password: Yup.string().required('Password is required'),
  });

  return validatorUtils.validate({schema, data: user});
};

module.exports.validateEmail = ({data}) => {
  const schema = Yup.object().shape({email: commonAuthSchema.email});

  return validatorUtils.validate({schema, data});
};

module.exports.validateResetPasswordRequest = ({data}) => {
  const schema = Yup.object().shape({password: commonAuthSchema.password});

  return validatorUtils.validate({schema, data});
};

module.exports.validateUserIdParams = ({data}) => {
  const schema = Yup.object().shape({
    _id: validatorUtils.mongooseIdValidate({name: 'User'}),
  });

  return validatorUtils.validate({schema, data});
};
module.exports.validateInviteUserRequest = ({data}) => {
  const schema = Yup.object().shape({
    email: commonAuthSchema.email,
    role: Yup.string().oneOf(usersConstants.SYSTEM_ROLES_VALUES).required(),
  });

  return validatorUtils.validate({schema, data});
};
module.exports.validateVerifyInvitedUserRequest = ({data}) => {
  const schema = Yup.object().shape({
    password: commonAuthSchema.password,
    firstName: commonAuthSchema.firstName,
    lastName: commonAuthSchema.lastName,
  });

  return validatorUtils.validate({schema, data});
};

module.exports.validateUpdateUserRequest = ({data}) => {
  const schema = Yup.object().shape({
    firstName: commonAuthSchema.firstName,
    lastName: commonAuthSchema.lastName,
  });

  return validatorUtils.validate({schema, data});
};

module.exports.validateLanguage = ({data}) => {
  const schema = Yup.object().shape({
    language: Yup.string()
      .required('Language is required')
      .oneOf(
        usersConstants.LANGUAGES_VALUES,
        'Language must be a valid language code'
      ),
  });

  return validatorUtils.validate({schema, data});
};

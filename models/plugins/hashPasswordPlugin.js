const {passwordsUtils} = require('../../utils');

module.exports = function hashPasswordPlugin(schema) {
  // Handle .save()
  schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
      this.password = await passwordsUtils.saltHashPassword({
        password: this.password,
      });
      next();
    } catch (err) {
      next(err);
    }
  });

  // Shared logic for update hooks
  const hashPasswordInUpdate = async function (next) {
    const update = this.getUpdate();
    if (!update) return next();

    const password = update.password || update.$set?.password;

    if (!password || typeof password !== 'string') return next();

    try {
      const hashed = await passwordsUtils.saltHashPassword({password});

      if (update.password) {
        update.password = hashed;
      }
      if (update.$set?.password) {
        update.$set.password = hashed;
      }

      next();
    } catch (err) {
      next(err);
    }
  };

  schema.pre(
    ['findOneAndUpdate', 'updateOne', 'updateMany'],
    hashPasswordInUpdate
  );
};

const populateFieldsPlugin = (schema, options = {}) => {
  const defaultPreHooks = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'findOneAndDelete',
    'save',
  ];
  const {fields = [], preHooks = defaultPreHooks} = options;

  schema.pre(preHooks, function (next) {
    const skipMiddlewareGlobalPopulation =
      this.options?.skipMiddlewareGlobalPopulation;
    if (skipMiddlewareGlobalPopulation) return next();

    if (fields.length > 0) {
      fields.forEach((field) => this.populate(field));
    }
    next();
  });

  schema.pre('aggregate', function (next) {
    if (fields.length > 0) {
      fields.forEach((field) => {
        const path = schema.path(field);
        if (path?.options?.ref) {
          const from = path.options.ref.toLowerCase();

          this.pipeline().unshift({
            $lookup: {
              from,
              localField: field,
              foreignField: '_id',
              as: field,
            },
          });
        }
      });
    }
    next();
  });
};

module.exports = populateFieldsPlugin;

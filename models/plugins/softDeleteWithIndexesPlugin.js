const softDeleteWithIndexesPlugin = (schema, options = {}) => {
  const defaultPreHooks = [
    'find',
    'findOne',
    'findById',
    'findOneAndUpdate',
    'findByIdAndUpdate',
    'updateOne',
    'updateMany',
    'findOneAndDelete',
    'findByIdAndDelete',
    'findOneAndReplace',
    'deleteOne',
    'deleteMany',
    'countDocuments',
    'replaceOne',
  ];

  const {preHooks = defaultPreHooks} = options;

  // Apply `deletedAt` filter to standard query operations
  schema.pre(preHooks, function (next) {
    const includeDeleted = Boolean(this.options?.includeDeleted);

    if (!includeDeleted) this.where({deletedAt: {$eq: null}});
    next();
  });

  // Apply `deletedAt` filter to aggregation operations
  schema.pre('aggregate', function (next) {
    const includeDeleted = Boolean(this.options?.includeDeleted);

    // Add `deletedAt` filter if not already present in the aggregation
    if (!includeDeleted)
      this.pipeline().unshift({$match: {deletedAt: {$eq: null}}});

    next();
  });

  if (options?.uniqueFields)
    options.uniqueFields.forEach((field) => {
      schema.index(
        {[field]: 1},
        {
          unique: true,
          name: `${field}_unique_index`,
          partialFilterExpression: {deletedAt: {$eq: null}},
        }
      );
    });
};

module.exports = softDeleteWithIndexesPlugin;

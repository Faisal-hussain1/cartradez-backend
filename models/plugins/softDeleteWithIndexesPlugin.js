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

  const {
    preHooks = defaultPreHooks,
    softDeleteField = 'deletedAt',
    activeFilter = {$eq: null},
  } = options;

  const hasSoftDeleteFilter = (query) => {
    if (!query || typeof query !== 'object') return false;
    if (Object.prototype.hasOwnProperty.call(query, softDeleteField)) return true;

    return Object.values(query).some((value) => {
      if (Array.isArray(value)) return value.some(hasSoftDeleteFilter);
      return hasSoftDeleteFilter(value);
    });
  };

  // Apply the active-record filter to standard query operations
  schema.pre(preHooks, function (next) {
    const includeDeleted = Boolean(this.options?.includeDeleted);
    const explicitlyFiltersSoftDeleteField = hasSoftDeleteFilter(this.getQuery());

    if (!includeDeleted && !explicitlyFiltersSoftDeleteField)
      this.where({[softDeleteField]: activeFilter});
    next();
  });

  // Apply the active-record filter to aggregation operations
  schema.pre('aggregate', function (next) {
    const includeDeleted = Boolean(this.options?.includeDeleted);

    const explicitlyFiltersSoftDeleteField = this.pipeline().some(
      (stage) => stage.$match && hasSoftDeleteFilter(stage.$match)
    );

    if (!includeDeleted && !explicitlyFiltersSoftDeleteField)
      this.pipeline().unshift({$match: {[softDeleteField]: activeFilter}});

    next();
  });

  if (options?.uniqueFields)
    options.uniqueFields.forEach((field) => {
      schema.index(
        {[field]: 1},
        {
          unique: true,
          name: `${field}_unique_index`,
          partialFilterExpression: {[softDeleteField]: activeFilter},
        }
      );
    });
};

module.exports = softDeleteWithIndexesPlugin;

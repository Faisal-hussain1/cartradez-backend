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

  const hasDeletedAtFilter = (query) => {
    if (!query || typeof query !== 'object') return false;
    if (Object.prototype.hasOwnProperty.call(query, 'deletedAt')) return true;

    return Object.values(query).some((value) => {
      if (Array.isArray(value)) return value.some(hasDeletedAtFilter);
      return hasDeletedAtFilter(value);
    });
  };

  // Apply `deletedAt` filter to standard query operations
  schema.pre(preHooks, function (next) {
    const includeDeleted = Boolean(this.options?.includeDeleted);
    const explicitlyFiltersDeletedAt = hasDeletedAtFilter(this.getQuery());

    if (!includeDeleted && !explicitlyFiltersDeletedAt)
      this.where({deletedAt: {$eq: null}});
    next();
  });

  // Apply `deletedAt` filter to aggregation operations
  schema.pre('aggregate', function (next) {
    const includeDeleted = Boolean(this.options?.includeDeleted);

    const explicitlyFiltersDeletedAt = this.pipeline().some(
      (stage) => stage.$match && hasDeletedAtFilter(stage.$match)
    );

    // Add `deletedAt` filter if not already present in the aggregation
    if (!includeDeleted && !explicitlyFiltersDeletedAt)
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

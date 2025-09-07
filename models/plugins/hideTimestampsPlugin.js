function hideTimestamps(schema) {
  schema.path('createdAt').select(false);
  schema.path('updatedAt').select(false);
}

module.exports = hideTimestamps;

/** @returns {Promise<import('jest').Config>} */
module.exports = async () => {
  return {
    testEnvironment: 'node',
    verbose: true,
    testTimeout: 20000,
  };
};

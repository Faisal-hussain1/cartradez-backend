const CronJob = require('cron').CronJob;

const logger = require('../middleware/loggerMiddleware');

async function createCronJob({timer, action, successMessage, failureMessage}) {
  let someJob = new CronJob(timer, async function () {
    try {
      await action();

      logger.info(`${successMessage} at ${Date()}`);
    } catch (error) {
      logger.error(failureMessage);
    }
  });

  return someJob;
}

// SAMPLE USAGE: Previously used to keep Heroku dynos awake.
// Not needed in current setup but kept as a reference for setting up cron jobs.
module.exports.setupCronJobSample = async ({frequencyInMinutes}) => {
  const awakeJob = await createCronJob({
    timer: `*/${frequencyInMinutes} * * * *`,
    action: async () => {
      logger.info('[Sample Cron] Simulating periodic action');
    },
    successMessage: '[Sample Cron] Action executed successfully',
    failureMessage: '[Sample Cron] Failed to execute action',
  });

  awakeJob.start();
};

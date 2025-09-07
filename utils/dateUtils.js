const {DateTime} = require('luxon');

const {TIME_ZONES} = require('../constants/generalConstant');

// Function to get the current date and time
function getCurrentDateTime() {
  return DateTime.now().toISO();
}

// Function to format a date to a specific format
function formatDate({date, format = 'yyyy-MM-dd'}) {
  return DateTime.fromISO(date).toFormat(format);
}
function isValidDate({date}) {
  return DateTime.fromISO(date).isValid;
}

function getCurrentTimestamp({zone = TIME_ZONES.utc.value} = {}) {
  return Math.floor(DateTime.now().setZone(zone).toSeconds());
}

module.exports = {
  getCurrentDateTime,
  formatDate,
  isValidDate,
  getCurrentTimestamp,
};

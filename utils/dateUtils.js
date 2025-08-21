const {DateTime} = require('luxon');

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

module.exports = {
  getCurrentDateTime,
  formatDate,
  isValidDate,
};

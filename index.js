require('dotenv').config();

const config = require('config');
// console.log('SENDGRID ENV:', process.env.SENDGRID_API_KEY);
// console.log('SENDGRID CONFIG:', config.get('sendgrid.apiKey'));
// console.log('DEFAULT EMAIL ADDRESS:', config.get('sendgrid.fromEmail'));
// console.log('DEFAULT EMAIL NAME:', config.get('sendgrid.fromName'));
const app = require('./app');
const socket = require('./socket');

const io = socket.prepare({app}); // In case the app doesn't require sockets, you can just comment the following part
const socketFlag = config.get('socket');
app.set(socketFlag, io);
module.exports.socket = app.get(socketFlag);

if (config.get('env') == config.get('envVariables.prod')) {
  // Here put anything/script that needs to run on production alone
}

if (config.get('env') == config.get('envVariables.dev')) {
  const testOnDevelopment = async () => {};

  testOnDevelopment();
}

require('./instrument');

const Sentry = require('@sentry/node');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');

const v1 = require('./apiVersions/v1');

const {
  refreshTokenMiddleware,
  finalResponseMiddleware,
  errorMiddleware,
  ddosProtectionMiddleware,
} = require('./middleware');
const swagger = require('./swagger');
const {corsOrigins} = require('./utils');

const app = express();

Sentry.setupExpressErrorHandler(app);

app.use(express.json());

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({origin: corsOrigins, credentials: true}));

app.use(ddosProtectionMiddleware);
v1.prepareV1Routes({app});

swagger({app});

app.get('/awake', (req, res) => {
  res.json();
});

// All other GET requests not handled before will return simple HTML
app.use((req, res, next) => {
  res.status(200).setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>This is an Express Server</h1></body></html>');
});

app.use(refreshTokenMiddleware);

app.use(errorMiddleware);
app.use(finalResponseMiddleware);

module.exports = app;

const Sentry = require('@sentry/node');
const config = require('config');

Sentry.init({
  dsn: config.get('sentryDsn'),
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: config.get('env'),
  beforeSend(event) {
    return !event.extra.isKnown || event.extra.submitToSentry ? event : null; // Submit the error to sentry only if the error is not known OR the error is known but we want to send it to sentry. We don't want all known errors to be sent in sentry.
  },
});

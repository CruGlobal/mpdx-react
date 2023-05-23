import dotenv from 'dotenv';
import Rollbar from 'rollbar';

dotenv.config();

if (!process.env.ROLLBAR_SERVER_ACCESS_TOKEN)
  throw new Error('ROLLBAR_SERVER_ACCESS_TOKEN is not defined.');

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_SERVER_ACCESS_TOKEN,
  environment: `react_${process.env.NODE_ENV}_server`,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export default rollbar;

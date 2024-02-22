import Rollbar from 'rollbar';

const rollbarServerAccessToken = process.env.ROLLBAR_SERVER_ACCESS_TOKEN;
export const isRollBarEnabled = !!rollbarServerAccessToken;

const rollbar = new Rollbar({
  accessToken: rollbarServerAccessToken,
  environment: `react_${process.env.NODE_ENV}_server`,
  captureUncaught: true,
  captureUnhandledRejections: true,
  enabled: isRollBarEnabled,
});

export default rollbar;

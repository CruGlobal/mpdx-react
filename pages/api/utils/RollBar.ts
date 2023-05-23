import Rollbar from 'rollbar';

if (!process.env.ROLLBAR_SERVER_ACCESS_TOKEN) {
  throw new Error('ROLLBAR_SERVER_ACCESS_TOKEN not defined');
}

const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_SERVER_ACCESS_TOKEN,
  environment: `react_${process.env.NODE_ENV}_server`,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export const reportError = (error: any) => {
  const isError =
    error instanceof Error &&
    typeof error === 'object' &&
    'name' in error &&
    'message' in error;

  const errorMsg = isError ? error.message : error;

  rollbar.error(errorMsg, error);
};

export default rollbar;

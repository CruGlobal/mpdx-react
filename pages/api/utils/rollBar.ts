import Rollbar from 'rollbar';
import { getErrorMessage } from 'src/lib/getErrorFromCatch';

const rollbarServerAccessToken = process.env.ROLLBAR_SERVER_ACCESS_TOKEN;
export const isRollBarEnabled = !!rollbarServerAccessToken;

const rollbar = new Rollbar({
  accessToken: rollbarServerAccessToken,
  environment: `react_${process.env.NODE_ENV}_server`,
  captureUncaught: true,
  captureUnhandledRejections: true,
  enabled: isRollBarEnabled,
  checkIgnore: (_, args) => {
    // Ignore React hydration warnings
    return (
      typeof args[0] === 'string' && args[0].includes('Expected server HTML')
    );
  },
});

export const logErrorOnRollbar = (error: unknown, page: string) => {
  if (isRollBarEnabled) {
    const errorMsg = getErrorMessage(error);
    const errorMetaData = error ?? {};
    rollbar.error(`${page} - ${errorMsg}`, errorMetaData);
  }
};

export default rollbar;

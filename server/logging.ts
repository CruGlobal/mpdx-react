import { client, v2 } from '@datadog/datadog-api-client';
import rollbar from './rollbar';

const configuration = client.createConfiguration();
const apiInstance = new v2.LogsApi(configuration);

const Logging = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pino = require('pino');
  const logger = pino({
    level: 'warn',
  });

  function getLoggingFunction(levelName: string) {
    const baseLogFn = (logger[levelName] || logger.info).bind(logger);
    return (...parts: any[]) => {
      let data: any = {};
      let error: object | undefined = undefined;

      const nativeError: object | undefined = parts.find(
        (it) =>
          (it && it instanceof Error) ||
          (it && typeof it === 'object' && 'name' in it && 'message' in it),
      );

      if (nativeError) {
        error = cleanObjectForSerialization(nativeError);
        rollbar.error((error as Error)?.message || 'Server Error', error);
      }

      // If next is trying to log funky stuff, put it into the data object.
      if (parts.length > 1) {
        data = data || {};
        if (data?.parts) {
          data.parts = parts.map((part) => cleanObjectForSerialization(part));
        }
      }

      try {
        const DDMessages =
          nativeError && parts.length === 1
            ? nativeError.toString()
            : parts.reduce((all, current) => {
                return (all += ` | ${current}`);
              }, '');

        const params: v2.LogsApiSubmitLogRequest = {
          body: [
            {
              ddsource: 'express server',
              ddtags: `env:${process.env.NODE_ENV}`,
              service: 'mpdx-react',
              message: DDMessages || '',
            },
          ],
          contentEncoding: 'gzip',
        };
        apiInstance.submitLog(params);
      } catch (e) {
        rollbar.error(
          'Server Error while trying to send log to DataDog.',
          e as Error,
        );
      }

      const messages =
        nativeError && parts.length === 1 ? [nativeError.toString()] : parts;
      baseLogFn({ data, error, type: levelName }, ...messages);
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nextBuiltInLogger = require('next/dist/build/output/log');
  for (const [property, value] of Object.entries(nextBuiltInLogger)) {
    if (typeof value !== 'function') continue;
    if (property !== 'error' && property !== 'warn' && property !== 'trace')
      continue;
    nextBuiltInLogger[property] = getLoggingFunction(property);
  }

  const loggingProperties = ['warn', 'error'];
  for (const property of loggingProperties) {
    // eslint-disable-next-line no-console
    console[property] = getLoggingFunction(property);
  }

  // Add general error logging.
  process.on('unhandledRejection', (error, promise) => {
    rollbar.error('unhandledRejection', {
      type: 'unhandledRejection',
      error: cleanObjectForSerialization(error),
      data: { promise: cleanObjectForSerialization(promise) },
    });
  });

  process.on('uncaughtException', (error) => {
    rollbar.error('uncaughtException', {
      type: 'unhandledRejection',
      error: cleanObjectForSerialization(error),
    });
  });
};

function cleanObjectForSerialization(value) {
  // Remove circular refs
  const removeCircular = (ref) => {
    for (const i in ref) {
      if (ref[i] === ref) delete ref[i];
      else if (typeof ref[i] === 'object') removeCircular(ref[i]);
    }
  };
  removeCircular(value);
  return value;
}

export default Logging;

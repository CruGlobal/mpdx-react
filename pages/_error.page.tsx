import { NextPage, NextPageContext } from 'next';
import NextErrorComponent from 'next/error';

interface ErrorPageProps {
  statusCode: number;
}

const ErrorPage: NextPage<ErrorPageProps> = ({ statusCode }) => {
  return <NextErrorComponent statusCode={statusCode} />;
};

ErrorPage.getInitialProps = ({
  req,
  res,
  err,
}: NextPageContext): ErrorPageProps => {
  const statusCode: number = res?.statusCode
    ? res.statusCode
    : err?.statusCode
    ? err.statusCode
    : 404;

  if (!process.browser) {
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ROLLBAR_SERVER_ACCESS_TOKEN
    ) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Rollbar = require('rollbar');
      const rollbar = new Rollbar({
        accessToken: process.env.ROLLBAR_SERVER_ACCESS_TOKEN,
        environment: 'react_production_server',
        captureUncaught: true,
        captureUnhandledRejections: true,
      });

      if (err) {
        rollbar.error(err, req);
      }
    } else {
      // eslint-disable-next-line no-console
      console.error('Error', err);
    }
  }
  return { statusCode };
};

export default ErrorPage;

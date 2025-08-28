import { NextPage, NextPageContext } from 'next';
import NextErrorComponent from 'next/error';
import rollbar, { isRollBarEnabled } from 'pages/api/utils/rollBar';

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
    if (isRollBarEnabled) {
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

/* eslint-disable jest/no-conditional-expect */
import { NextPageContext } from 'next';
import { render } from '@testing-library/react';
import rollbar from 'pages/api/utils/rollBar';
import ErrorPage from './_error.page';

jest.mock('pages/api/utils/rollBar', () => ({
  error: jest.fn(),
  isRollBarEnabled: true,
}));

const createContext = (requestStatusCode, errorStatusCode) =>
  ({
    req: { query: 'test' },
    res: { statusCode: requestStatusCode },
    err: { statusCode: errorStatusCode, message: 'Test Message' },
  } as unknown as NextPageContext);

describe('Error Page', () => {
  describe('Status codes', () => {
    it('Should return Response statusCode 500', async () => {
      if (ErrorPage.getInitialProps) {
        const props = await ErrorPage.getInitialProps(createContext(500, 501));
        expect(props).toEqual({
          statusCode: 500,
        });
        const { getByText } = render(<ErrorPage {...props} />);
        expect(getByText('500')).toBeVisible();
      } else {
        expect(1).toEqual(2);
      }
    });

    it('Should return Error statusCode 501', async () => {
      if (ErrorPage.getInitialProps) {
        const props = await ErrorPage.getInitialProps(
          createContext(undefined, 501),
        );
        expect(props).toEqual({
          statusCode: 501,
        });
        const { getByText } = render(<ErrorPage {...props} />);
        expect(getByText('501')).toBeVisible();
      } else {
        expect(1).toEqual(2);
      }
    });

    it('returns statusCode 404 if Response & Error statusCode are not defined', async () => {
      if (ErrorPage.getInitialProps) {
        const props = await ErrorPage.getInitialProps(
          createContext(undefined, undefined),
        );
        expect(props).toEqual({
          statusCode: 404,
        });

        const { getByText } = render(<ErrorPage {...props} />);
        expect(getByText('404')).toBeVisible();
      } else {
        expect(1).toEqual(2);
      }
    });
  });

  describe('Rollbar', () => {
    it('should have called Rollbar', () => {
      if (ErrorPage.getInitialProps) {
        ErrorPage.getInitialProps(createContext(undefined, 500));
        expect(rollbar.error).toHaveBeenCalledWith(
          { statusCode: 500, message: 'Test Message' },
          { query: 'test' },
        );
      } else {
        expect(1).toEqual(2);
      }
    });
  });
});

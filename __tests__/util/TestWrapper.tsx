import React, { ReactElement, ReactNode } from 'react';
import { ApolloLink, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import {
  MockLink,
  MockedProvider,
  MockedResponse,
} from '@apollo/client/testing';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { SnackbarProvider } from 'notistack';
import TestRouter from './TestRouter';

export type OnErrorMock = (error: string) => void;

interface Props {
  mocks?: MockedResponse[];
  children: ReactNode;
  cache?: InMemoryCache;
  onErrorMock?: OnErrorMock;
}

const TestWrapper = ({
  mocks = [],
  children,
  cache = new InMemoryCache({ addTypename: false }),
  onErrorMock,
}: Props): ReactElement => {
  const mockLink = new MockLink(mocks);
  const errorLoggingLink = onError(({ networkError }) => {
    if (networkError) {
      // eslint-disable-next-line no-console
      console.warn(`[Network error]: ${networkError}`);
      if (onErrorMock) {
        onErrorMock(JSON.stringify(networkError.message));
      }
    }
  });
  const link = ApolloLink.from([errorLoggingLink, mockLink]);

  return (
    <TestRouter>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider
            mocks={mocks}
            cache={cache}
            addTypename={false}
            link={link}
          >
            {children}
          </MockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </TestRouter>
  );
};

export default TestWrapper;

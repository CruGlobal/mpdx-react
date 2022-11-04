import { MockedResponse, MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import React, { ReactElement, ReactNode } from 'react';
import { InMemoryCache } from '@apollo/client';
import TestRouter from './TestRouter';

interface Props {
  mocks?: MockedResponse[];
  children: ReactNode;
  cache?: InMemoryCache;
}

const TestWrapper = ({
  mocks = [],
  children,
  cache = new InMemoryCache({ addTypename: false }),
}: Props): ReactElement => {
  return (
    <TestRouter>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
            <>{children}</>
          </MockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </TestRouter>
  );
};

export default TestWrapper;

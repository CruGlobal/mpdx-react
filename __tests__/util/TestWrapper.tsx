import { MockedResponse, MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
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
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
            <>{children}</>
          </MockedProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>
    </TestRouter>
  );
};

export default TestWrapper;

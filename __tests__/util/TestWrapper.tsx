import { MockedResponse, MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import React, { ReactElement, ReactNode } from 'react';
import { InMemoryCache } from '@apollo/client';
import { AppProvider } from '../../src/components/App';
import { AppState } from '../../src/components/App/rootReducer';
import TestRouter from './TestRouter';

interface Props {
  mocks?: MockedResponse[];
  children: ReactNode;
  initialState?: Partial<AppState>;
  disableAppProvider?: boolean;
  cache?: InMemoryCache;
}

const TestWrapper = ({
  mocks = [],
  children,
  initialState = { accountListId: 'abc' },
  disableAppProvider = false,
  cache = new InMemoryCache({ addTypename: false }),
}: Props): ReactElement => {
  return (
    <TestRouter>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <SnackbarProvider>
          <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
            {disableAppProvider ? (
              <>{children}</>
            ) : (
              <AppProvider initialState={initialState}>{children}</AppProvider>
            )}
          </MockedProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>
    </TestRouter>
  );
};

export default TestWrapper;

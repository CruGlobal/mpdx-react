import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../../src/theme';
import { GetAppealsQuery } from '../../../../pages/accountLists/[accountListId]/tools/GetAppeals.generated';
import Appeals from './Appeals';

const accountListId = 'test121';

const router = {
  query: { accountListId },
  isReady: true,
};

const testAppeal = {
  id: '1',
  name: 'Test Appeal',
  amount: 200,
  amountCurrency: 'CAD',
  pledgesAmountNotReceivedNotProcessed: 5,
  pledgesAmountReceivedNotProcessed: 15,
  pledgesAmountProcessed: 25,
  pledgesAmountTotal: 55,
};

describe('AppealsTest', () => {
  it('show titles', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider>
              <Appeals accountListId={accountListId} />
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>,
    );
    expect(getByText('Primary Appeal')).toBeInTheDocument();
    expect(getByText('Appeals')).toBeInTheDocument();
  });

  it('should render an appeal', async () => {
    const { getByText, getByTestId } = render(
      <SnackbarProvider>
        <ThemeProvider theme={theme}>
          <TestRouter router={router}>
            <GqlMockedProvider<GetAppealsQuery>
              mocks={{
                GetAppeals: {
                  appeals: {
                    nodes: [testAppeal],
                  },
                },
              }}
            >
              <Appeals accountListId={accountListId} />
            </GqlMockedProvider>
          </TestRouter>
        </ThemeProvider>
      </SnackbarProvider>,
    );
    await waitFor(() =>
      expect(getByText('Primary Appeal')).toBeInTheDocument(),
    );
    await waitFor(() => expect(getByText('Appeals')).toBeInTheDocument());
    await waitFor(() =>
      expect(getByTestId('TypographyShowing').textContent).toEqual(
        'Showing 2 of 2',
      ),
    );
  });
});

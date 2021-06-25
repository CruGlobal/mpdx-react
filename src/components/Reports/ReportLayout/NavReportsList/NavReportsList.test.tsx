import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { NavReportsList } from './NavReportsList';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';

const accountListId = 'account-list-1';
const selected = 'salaryCurrency';

const router = {
  query: { accountListId },
  isReady: true,
};

describe('NavReportsList', () => {
  it('default', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <NavReportsList selected={selected} />
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByText('Donations')).toBeInTheDocument();
    expect(getByText('Month Report (Partner Currency)')).toBeInTheDocument();
    expect(getByText('Month Report (Salary Currency)')).toBeInTheDocument();
    expect(getByText('Designation counts')).toBeInTheDocument();
    expect(getByText('Responsibility nters')).toBeInTheDocument();
    expect(getByText('Expected Monthly Total')).toBeInTheDocument();
    expect(getByText('Partner Giving Analysis')).toBeInTheDocument();
    expect(getByText('Coaching')).toBeInTheDocument();
  });
});

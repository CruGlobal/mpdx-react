import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import { NavReportsList } from './NavReportsList';
import theme from 'src/theme';

const selected = 'salaryCurrency';

describe('NavReportsList', () => {
  it('default', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <NavReportsList selected={selected} />
      </ThemeProvider>,
    );

    expect(getByText('Dashboard')).toBeInTheDocument();
    expect(getByText('Contacts')).toBeInTheDocument();
    expect(getByText('Reports')).toBeInTheDocument();
    expect(getByText('Tools')).toBeInTheDocument();
    expect(getByText('Coaches')).toBeInTheDocument();
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

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from 'src/theme';
import { mockData } from '../mockData';
import { MonthlyDonationTable } from './Table';

const router = {
  pathname:
    '/accountLists/[accountListId]/reports/partnerGivingAnalysis/[[...contactId]]',
  query: {
    accountListId: 'account-list-1',
  },
  isReady: true,
  push: jest.fn(),
};

const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <ContactPanelProvider>
        <MonthlyDonationTable
          data={mockData}
          totalDonations={685}
          emptyPlaceholder={<div>No Data</div>}
        />
      </ContactPanelProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('MonthlyDonationTable', () => {
  it('renders correctly', async () => {
    const { findByRole, getByRole } = render(<Components />);

    expect(await findByRole('grid')).toBeInTheDocument();

    expect(getByRole('columnheader', { name: 'Donor ID' })).toBeInTheDocument();
    expect(
      getByRole('columnheader', { name: 'Ministry Partner' }),
    ).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Date' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Type' })).toBeInTheDocument();
    expect(getByRole('columnheader', { name: 'Amount' })).toBeInTheDocument();

    expect(getByRole('gridcell', { name: '159486753' })).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: 'Amelia Walker' }),
    ).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Jun 17, 2023' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'EFT' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: '$85.00' })).toBeInTheDocument();
  });

  it('click event should happen', async () => {
    const { findByRole } = render(<Components />);

    expect(await findByRole('link', { name: 'Amelia Walker' })).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/partnerGivingAnalysis/159486753',
    );
  });
});

import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { PartnerGivingAnalysisReportContact } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { GetPartnerGivingAnalysisReportQuery } from '../PartnerGivingAnalysisReport.generated';
import { PartnerGivingAnalysisReportTable } from './Table';
import type { Order } from '../../Reports.type';

const router = {
  pathname:
    '/accountLists/[accountListId]/reports/partnerGivingAnalysis/[[...contactId]]',
  query: {
    accountListId: 'account-list-1',
  },
  isReady: true,
  push: jest.fn(),
};

type Contact = PartnerGivingAnalysisReportContact;

const order: Order = 'asc';
const orderBy: keyof Contact = 'name';
const ids = [];
const isRowChecked = jest.fn();
const onRequestSort = jest.fn();
const onSelectAll = jest.fn();
const onSelectOne = jest.fn();

const mocks: {
  GetPartnerGivingAnalysisReport: GetPartnerGivingAnalysisReportQuery;
} = {
  GetPartnerGivingAnalysisReport: {
    partnerGivingAnalysisReport: {
      contacts: [
        {
          donationPeriodAverage: 88.468,
          donationPeriodCount: 176,
          donationPeriodSum: 15218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-07-07',
          id: '01',
          name: 'Ababa, Aladdin und Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 15218.42,
        },
        {
          donationPeriodAverage: 71.4,
          donationPeriodCount: 127,
          donationPeriodSum: 13118.42,
          lastDonationAmount: 170.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-03-07',
          id: '02',
          name: 'Princess',
          pledgeCurrency: 'CAD',
          totalDonations: 13118.42,
        },
        {
          donationPeriodAverage: 86.4682954545454545,
          donationPeriodCount: 221,
          donationPeriodSum: 25218.42,
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '03',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 120,
        totalPages: 12,
      },
      totalContacts: 300,
    },
  },
};

const allContactIds =
  mocks.GetPartnerGivingAnalysisReport.partnerGivingAnalysisReport?.contacts.map(
    (contact) => contact.id,
  ) ?? [];

const defaultProps = {
  order,
  orderBy,
  onRequestSort,
  onSelectAll,
  onSelectOne,
  ids,
  allContactIds,
  isRowChecked,
};

const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <ContactPanelProvider>
        <PartnerGivingAnalysisReportTable
          {...defaultProps}
          contacts={
            mocks.GetPartnerGivingAnalysisReport.partnerGivingAnalysisReport
              .contacts
          }
        />
      </ContactPanelProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('PartnerGivingAnalysisReportTable', () => {
  it('default', async () => {
    const { getAllByTestId, getByRole, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByTestId('PartnerGivingAnalysisReportTableRow').length).toBe(
      3,
    );
    expect(queryByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
  });

  it('check event should happen', async () => {
    const { getAllByRole, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    const checkbox = getAllByRole('checkbox')[0];
    userEvent.click(checkbox);
    expect(onSelectOne).toHaveBeenCalled();
  });

  it('click event should happen', async () => {
    const { getByRole, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(
      getByRole('link', { name: 'Ababa, Aladdin und Jasmine (Princess)' }),
    ).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/partnerGivingAnalysis/01',
    );
  });
});

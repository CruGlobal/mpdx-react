import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { PartnerGivingAnalysisContact } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { PartnerGivingAnalysisTable } from './Table';
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

type Contact = PartnerGivingAnalysisContact;

const order: Order = 'asc';
const orderBy: keyof Contact = 'name';
const ids = [];
const isRowChecked = jest.fn();
const onRequestSort = jest.fn();
const onSelectAll = jest.fn();
const onSelectOne = jest.fn();

const mocks = {
  PartnerGivingAnalysis: {
    partnerGivingAnalysis: {
      nodes: [
        {
          donationPeriodAverage: 88.468,
          donationPeriodCount: 176,
          donationPeriodSum: 15218.42,
          firstDonationDate: '2019-01-01',
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
          firstDonationDate: '2020-01-01',
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
          firstDonationDate: '2018-01-01',
          lastDonationAmount: 150.92,
          lastDonationCurrency: 'CAD',
          lastDonationDate: '2021-08-07',
          id: '03',
          name: 'Jasmine (Princess)',
          pledgeCurrency: 'CAD',
          totalDonations: 25218.42,
        },
      ],
      pageInfo: {
        endCursor: 'MTA',
        hasNextPage: false,
        hasPreviousPage: false,
      },
      edges: [{ cursor: 'OA' }, { cursor: 'OQ' }, { cursor: 'MTA' }],
      totalCount: 300,
      totalPageCount: 12,
    },
  },
};

const allContactIds =
  mocks.PartnerGivingAnalysis.partnerGivingAnalysis?.nodes.map(
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
        <PartnerGivingAnalysisTable
          {...defaultProps}
          data={mocks.PartnerGivingAnalysis.partnerGivingAnalysis.nodes}
          totalCount={
            mocks.PartnerGivingAnalysis.partnerGivingAnalysis.totalCount
          }
        />
      </ContactPanelProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('PartnerGivingAnalysisReportTable', () => {
  it('default', async () => {
    const { getAllByRole, getByRole, queryByTestId } = render(<Components />);

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByRole('grid')).toBeInTheDocument();
    expect(getAllByRole('row').length).toBe(4); // 3 rows + header
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
      '/accountLists/account-list-1/reports/partnerGivingAnalysis/01?tab=Donations',
    );
  });
});

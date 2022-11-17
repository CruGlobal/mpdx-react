import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { GetPartnerGivingAnalysisReportQuery } from './PartnerGivingAnalysisReport.generated';
import { PartnerGivingAnalysisReport } from './PartnerGivingAnalysisReport';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

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

describe('PartnerGivingAnalysisReport', () => {
  it('loading', async () => {
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery>>
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(queryByText(title)).toBeInTheDocument();
    expect(
      queryByTestId('LoadingPartnerGivingAnalysisReport'),
    ).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeNull();
  });

  it('loaded', async () => {
    const { getAllByTestId, getByTestId, queryByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery> mocks={mocks}>
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={true}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByTestId('PartnerGivingAnalysisReportTableRow').length).toBe(
      3,
    );
    expect(getByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
  });

  it('nav list closed', async () => {
    const { getByTestId, queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<GetPartnerGivingAnalysisReportQuery> mocks={mocks}>
          <PartnerGivingAnalysisReport
            accountListId={accountListId}
            isNavListOpen={false}
            title={title}
            onNavListToggle={onNavListToggle}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(queryByText(title)).toBeInTheDocument();
    expect(getByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
    expect(queryByTestId('ReportNavList')).toBeNull();
  });
});

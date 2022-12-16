import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { PartnerGivingAnalysisReportTable } from './Table';
import theme from 'src/theme';
import { GetPartnerGivingAnalysisReportQuery } from '../PartnerGivingAnalysisReport.generated';

const onClick = jest.fn();
const onRequestSort = jest.fn();
const onSelectAll = jest.fn();
const onSelectOne = jest.fn();
const selectedContacts: Array<string> = [];

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

describe('PartnerGivingAnalysisReportTable', () => {
  it('default', async () => {
    const { getAllByTestId, getByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PartnerGivingAnalysisReportTable
          order="asc"
          orderBy={null}
          selectedContacts={selectedContacts}
          onRequestSort={onRequestSort}
          onClick={onClick}
          onSelectAll={onSelectAll}
          onSelectOne={onSelectOne}
          contacts={
            mocks.GetPartnerGivingAnalysisReport.partnerGivingAnalysisReport
              .contacts
          }
        />
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
    expect(queryByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
  });

  it('check event should happen', async () => {
    const { getAllByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PartnerGivingAnalysisReportTable
          order="asc"
          orderBy={null}
          selectedContacts={selectedContacts}
          onRequestSort={onRequestSort}
          onClick={onClick}
          onSelectAll={onSelectAll}
          onSelectOne={onSelectOne}
          contacts={
            mocks.GetPartnerGivingAnalysisReport.partnerGivingAnalysisReport
              .contacts
          }
        />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    const checkbox = getAllByRole('checkbox')[0];
    userEvent.click(checkbox);
    expect(onSelectAll).toHaveBeenCalled();
  });

  it('click event should happen', async () => {
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PartnerGivingAnalysisReportTable
          order="asc"
          orderBy={null}
          selectedContacts={selectedContacts}
          onRequestSort={onRequestSort}
          onClick={onClick}
          onSelectAll={onSelectAll}
          onSelectOne={onSelectOne}
          contacts={
            mocks.GetPartnerGivingAnalysisReport.partnerGivingAnalysisReport
              .contacts
          }
        />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    userEvent.click(getByText('Ababa, Aladdin und Jasmine (Princess)'));
    expect(onClick).toHaveBeenCalledWith('01');
  });
});

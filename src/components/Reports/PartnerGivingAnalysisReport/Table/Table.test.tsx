import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { PartnerGivingAnalysisReportTable } from './Table';
import theme from 'src/theme';

const onRequestSort = jest.fn();
const onSelectAll = jest.fn();
const onSelectOne = jest.fn();
const selectedContacts: Array<string> = [];

const mocks = {
  PartnerGivingAnalysisReport: {
    partnerGivingAnalysisReport: [
      {
        giftAverage: 88.468,
        giftCount: 176,
        giftTotal: 15218.42,
        currency: 'CAD',
        lastGiftAmount: 150.92,
        lastGiftDate: '2021-07-07',
        id: '01',
        name: 'Ababa, Aladdin und Jasmine (Princess)',
        lifeTimeTotal: 15218.42,
      },
      {
        giftAverage: 71.4,
        giftCount: 127,
        giftTotal: 13118.42,
        currency: 'CAD',
        lastGiftAmount: 170.92,
        lastGiftDate: '2021-03-07',
        id: '02',
        name: 'Princess',
        lifeTimeTotal: 13118.42,
      },
      {
        giftAverage: 86.4682954545454545,
        giftCount: 221,
        giftTotal: 25218.42,
        currency: 'CAD',
        lastGiftAmount: 150.92,
        lastGiftDate: '2021-08-07',
        id: '03',
        name: 'Jasmine (Princess)',
        lifeTimeTotal: 25218.42,
      },
    ],
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
          onSelectAll={onSelectAll}
          onSelectOne={onSelectOne}
          contacts={
            mocks.PartnerGivingAnalysisReport.partnerGivingAnalysisReport
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
    // expect(queryByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
  });

  it('check event should happen', async () => {
    const { getAllByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <PartnerGivingAnalysisReportTable
          order="asc"
          orderBy={null}
          selectedContacts={selectedContacts}
          onRequestSort={onRequestSort}
          onSelectAll={onSelectAll}
          onSelectOne={onSelectOne}
          contacts={
            mocks.PartnerGivingAnalysisReport.partnerGivingAnalysisReport
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
});

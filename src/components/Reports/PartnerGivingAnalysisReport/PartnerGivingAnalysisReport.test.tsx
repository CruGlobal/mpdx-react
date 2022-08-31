import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
// import { PartnerGivingAnalysisReportQuery } from './GetPartnerGivingAnalysisReport.generated';
import { PartnerGivingAnalysisReport } from './PartnerGivingAnalysisReport';
// import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';

const accountListId = '111';
const title = 'test title';
const onNavListToggle = jest.fn();

// const mocks = {
//   PartnerGivingAnalysisReport: {
//     partnerGivingAnalysisReport: [
//       {
//         giftAverage: 88.468,
//         giftCount: 176,
//         giftTotal: 15218.42,
//         currency: 'CAD',
//         lastGiftAmount: 150.92,
//         lastGiftDate: '2021-07-07',
//         id: '01',
//         name: 'Ababa, Aladdin und Jasmine (Princess)',
//         lifeTimeTotal: 15218.42,
//       },
//       {
//         giftAverage: 71.4,
//         giftCount: 127,
//         giftTotal: 13118.42,
//         currency: 'CAD',
//         lastGiftAmount: 170.92,
//         lastGiftDate: '2021-03-07',
//         id: '02',
//         name: 'Princess',
//         lifeTimeTotal: 13118.42,
//       },
//       {
//         giftAverage: 86.4682954545454545,
//         giftCount: 221,
//         giftTotal: 25218.42,
//         currency: 'CAD',
//         lastGiftAmount: 150.92,
//         lastGiftDate: '2021-08-07',
//         id: '03',
//         name: 'Jasmine (Princess)',
//         lifeTimeTotal: 25218.42,
//       },
//     ],
//   },
// };

// const errorMocks = {
//   PartnerGivingAnalysisReport: {},
//   error: {
//     hidden: true,
//     name: 'error',
//     message: 'Error loading data.  Try again.',
//   },
// };

describe('PartnerGivingAnalysisReport', () => {
  it('loading', async () => {
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        {/* <GqlMockedProvider<PartnerGivingAnalysisReportQuery>> */}
        <PartnerGivingAnalysisReport
          accountListId={accountListId}
          isNavListOpen={true}
          title={title}
          onNavListToggle={onNavListToggle}
        />
        {/* </GqlMockedProvider> */}
      </ThemeProvider>,
    );

    expect(queryByText(title)).toBeInTheDocument();
    // expect(
    //   queryByTestId('LoadingPartnerGivingAnalysisReport'),
    // ).toBeInTheDocument();
    expect(queryByTestId('Notification')).toBeNull();
  });

  it('loaded', async () => {
    const { getAllByTestId, queryByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        {/* <GqlMockedProvider<PartnerGivingAnalysisReportQuery> mocks={mocks}> */}
        <PartnerGivingAnalysisReport
          accountListId={accountListId}
          isNavListOpen={true}
          title={title}
          onNavListToggle={onNavListToggle}
        />
        {/* </GqlMockedProvider> */}
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(getByRole('table')).toBeInTheDocument();
    expect(getAllByTestId('PartnerGivingAnalysisReportTableRow').length).toBe(
      10,
    );
    // expect(getByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
  });

  it('nav list closed', async () => {
    const { queryByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        {/* <GqlMockedProvider<PartnerGivingAnalysisReportQuery> mocks={mocks}> */}
        <PartnerGivingAnalysisReport
          accountListId={accountListId}
          isNavListOpen={false}
          title={title}
          onNavListToggle={onNavListToggle}
        />
        {/* </GqlMockedProvider> */}
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(
        queryByTestId('LoadingPartnerGivingAnalysisReport'),
      ).not.toBeInTheDocument();
    });

    expect(queryByText(title)).toBeInTheDocument();
    // expect(getByTestId('PartnerGivingAnalysisReport')).toBeInTheDocument();
    expect(queryByTestId('ReportNavList')).toBeNull();
  });
});

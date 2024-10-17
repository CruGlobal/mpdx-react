import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { Box } from '@mui/material';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AccountListTypeEnum } from '../CoachingDetail';
import { MonthlyCommitment } from './MonthlyCommitment';
import {
  GetReportsPledgeHistoriesDocument,
  GetReportsPledgeHistoriesQuery,
} from './MonthlyCommitment.generated';

export default {
  title: 'Coaching/CoachingDetail/MonthlyCommitment',
};

const coachingId = 'coaching-id';
export const Default = (): ReactElement => {
  return (
    <Box m="4">
      <GqlMockedProvider<{
        GetReportsPledgeHistories: GetReportsPledgeHistoriesQuery;
      }>
        mocks={{
          GetReportsPledgeHistories: {
            reportPledgeHistories: [...Array(12)].map((x, i) => {
              return {
                startDate: DateTime.local().minus({ month: i }).toISO(),
                endDate: DateTime.local().minus({ month: i }).toISO(),
              };
            }),
          },
        }}
      >
        <MonthlyCommitment
          coachingId={coachingId}
          accountListType={AccountListTypeEnum.Own}
          mpdInfo={null}
          currencyCode="USD"
        />
      </GqlMockedProvider>
    </Box>
  );
};

export const Loading = (): ReactElement => {
  return (
    <Box m="4">
      <MockedProvider
        mocks={[
          {
            request: {
              query: GetReportsPledgeHistoriesDocument,
            },
            result: {},
            delay: 100931731455,
          },
        ]}
      >
        <MonthlyCommitment
          coachingId={coachingId}
          accountListType={AccountListTypeEnum.Own}
          mpdInfo={null}
          currencyCode="USD"
        />
      </MockedProvider>
    </Box>
  );
};

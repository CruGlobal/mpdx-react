import React, { ReactElement } from 'react';
import { gqlMock } from '__tests__/util/graphqlMocking';
import {
  CoachedPersonFragment,
  CoachedPersonFragmentDoc,
} from '../LoadCoachingList.generated';
import { CoachingRow } from './CoachingRow';

export default {
  title: 'Coaching/CoachingList/Row',
};

export const Default = (): ReactElement => {
  const coach = gqlMock<CoachedPersonFragment>(CoachedPersonFragmentDoc, {
    mocks: {
      currency: 'USD',
      primaryAppeal: {
        amountCurrency: 'EUR',
      },
    },
  });
  return (
    <CoachingRow accountListId="account-list-id" coachingAccount={coach} />
  );
};

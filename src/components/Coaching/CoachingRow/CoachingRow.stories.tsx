import React, { ReactElement } from 'react';
import {
  CoachedPersonFragment,
  CoachedPersonFragmentDoc,
} from '../LoadCoachingList.generated';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
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
  return <CoachingRow coachingAccount={coach} />;
};

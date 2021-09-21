import React, { ReactElement } from 'react';
import { CoachFragment, CoachFragmentDoc } from '../LoadCoachingList.generated';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
import { CoachingRow } from './CoachingRow';

export default {
  title: 'Coaching/CoachingList/Row',
};

export const Default = (): ReactElement => {
  const coach = gqlMock<CoachFragment>(CoachFragmentDoc, {
    mocks: {
      currency: 'USD',
      primaryAppeal: {
        amountCurrency: 'EUR',
      },
    },
  });
  return <CoachingRow coach={coach} />;
};

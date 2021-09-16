import React, { ReactElement } from 'react';
import { CoachFragment, CoachFragmentDoc } from '../LoadCoachingList.generated';
import { CoachingRow } from './CoachingRow';
import { gqlMock } from '__tests__/util/graphqlMocking';

export default {
  title: 'Coaching/CoachingList/Row',
};

export const Default = (): ReactElement => {
  const coach = gqlMock<CoachFragment>(CoachFragmentDoc, {
    mocks: {
      currency: 'USD',
    },
  });
  return <CoachingRow coach={coach} />;
};

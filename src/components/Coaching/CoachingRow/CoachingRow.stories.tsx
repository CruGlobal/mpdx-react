import React, { ReactElement } from 'react';
import {
  CoachedPersonFragment,
  CoachedPersonFragmentDoc,
  CurrentAccountListFragment,
  CurrentAccountListFragmentDoc,
} from '../LoadCoachingList.generated';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
import { CoachingRow } from './CoachingRow';

export default {
  title: 'Coaching/CoachingList/Row',
};

const coach = gqlMock<CoachedPersonFragment>(CoachedPersonFragmentDoc, {
  mocks: {
    name: 'Coaching',
    currency: 'USD',
    primaryAppeal: {
      amountCurrency: 'EUR',
    },
  },
});

const accountList = gqlMock<CurrentAccountListFragment>(
  CurrentAccountListFragmentDoc,
  {
    mocks: {
      name: 'AccountList',
      currency: 'EUR',
      primaryAppeal: { amountCurrency: 'JPY' },
    },
  },
);

export const Default = (): ReactElement => {
  return <CoachingRow accountList={accountList} coachingAccount={coach} />;
};

export const NoCoaching = (): ReactElement => {
  return <CoachingRow accountList={accountList} coachingAccount={null} />;
};

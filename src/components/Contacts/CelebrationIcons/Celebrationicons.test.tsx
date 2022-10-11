import React from 'react';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';
import { CelebrationIcons } from './CelebrationIcons';
import {
  CelebrationItemsFragment,
  CelebrationItemsFragmentDoc,
} from './CelebrationItems.generated';

// eslint-disable-next-line jest/no-disabled-tests
it.skip('should display ring', () => {
  const today = DateTime.now();
  const day = today.day ?? 0;
  const month = today.month ?? 0;
  const mock = gqlMock<CelebrationItemsFragment>(CelebrationItemsFragmentDoc, {
    mocks: {
      people: {
        nodes: [
          {
            anniversaryMonth: month,
            anniversaryDay: day,
            birthdayDay: day,
            birthdayMonth: month,
          },
        ],
      },
    },
  });
  const { getByRole } = render(<CelebrationIcons contact={mock} />);

  expect(getByRole('img', { hidden: true, name: 'Cake' })).toBeVisible();
  expect(getByRole('img', { hidden: true, name: 'Ring' })).toBeVisible();
});

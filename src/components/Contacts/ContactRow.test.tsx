import React from 'react';
import { render, within } from '@testing-library/react';
import { gqlMock } from '../../../__tests__/util/graphqlMocking';
import { ContactRow } from './ContactRow';
import {
  ContactRowFragment,
  ContactRowFragmentDoc,
} from './ContactRow.generated';

const accountListId = 'abc';

it('should display contact name', () => {
  const name = 'Name';
  const contact = gqlMock<ContactRowFragment>(ContactRowFragmentDoc, {
    mocks: { name },
  });
  const { getByRole } = render(
    <ContactRow
      accountListId={accountListId}
      contact={contact}
      onContactSelected={() => {}}
    />,
  );
  expect(within(getByRole('row')).getByText(name)).toBeVisible();
});
